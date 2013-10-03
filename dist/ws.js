(function(e){if("function"==typeof bootstrap)bootstrap("rtree",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeRtree=e}else"undefined"!=typeof window?window.rtree=e():self.rtree=e()})(function(){var define,ses,bootstrap,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var rtree = require('rtree');
var transform = require('./transform');
var simplify = require('./simplifyGeojson');
var resolution = require('./resolution');
function RT(quantization){
	if(!(this instanceof RT)){
		return new RT(quantization);
	}
	this.tree = rtree();
	this.getResolution =resolution(quantization);
}
RT.prototype.insert =function(thing){
	this.tree.geoJSON(transform.from.any(thing));
};
RT.prototype.get = function(bbox){
	var tBox = transform.from.line(bbox);
	var resolution = this.getResolution(tBox);
	var treeReturn = this.tree.bbox(tBox);
	var simplifiedTree = simplify(resolution).any(treeReturn);
	var out = transform.to.any(simplifiedTree);
	return out;
};
module.exports = RT;
},{"./resolution":3,"./simplifyGeojson":5,"./transform":6,"rtree":8}],2:[function(require,module,exports){
//from https://github.com/Leaflet/Leaflet/blob/master/src/geo/projection/Projection.SphericalMercator.js
var mlat = 85.0511287798;
var d2r = Math.PI / 180;
var r2d = 180 / Math.PI;
var r = 6378137;
exports.project = function(latlng) {
	var lat = Math.max(Math.min(mlat, latlng[1]), -mlat);
	var x = latlng[0] * d2r;
	var y = lat * d2r;
	y = Math.log(Math.tan((Math.PI / 4) + (y / 2)));

	return [x*r, y*r];
};
exports.unproject = function(point) {
	var lng = point[0] * r2d/r;
	var lat = (2 * Math.atan(Math.exp(point[1]/r)) - (Math.PI / 2)) * r2d;
	return [lng,lat];
};

},{}],3:[function(require,module,exports){
module.exports = function(quantizaiton){
	return function(bounds){
		var metric = Math.max(Math.abs(bounds[0][0]-bounds[1][0]),Math.abs(bounds[0][1]-bounds[1][1]))/quantizaiton;
		console.log(metric);
		return metric;
	};
};
},{}],4:[function(require,module,exports){
//from https://github.com/mourner/simplify-js/blob/master/simplify.js
/*
 Copyright (c) 2013, Vladimir Agafonkin
 Simplify.js is a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/
function getSquareDistance(p1, p2) { // square distance between 2 points

	var dx = p1[0] - p2[0],
		dy = p1[1] - p2[1];

	return dx * dx + dy * dy;
}

function getSquareSegmentDistance(p, p1, p2) { // square distance from a point to a segment

	var x = p1[0],
		y = p1[1],

		dx = p2[0] - x,
		dy = p2[1] - y,

		t;

	if (dx !== 0 || dy !== 0) {

		t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

		if (t > 1) {
			x = p2[0];
			y = p2[1];

		}
		else if (t > 0) {
			x += dx * t;
			y += dy * t;
		}
	}

	dx = p[0] - x;
	dy = p[1] - y;

	return dx * dx + dy * dy;
}

// the rest of the code doesn't care for the point format


// basic distance-based simplification

Simplify.prototype.simplifyRadialDistance = function (points) {

	var i,
	len = points.length,
		point,
		prevPoint = points[0],
		newPoints = [prevPoint];

	for (i = 1; i < len; i++) {
		point = points[i];

		if (getSquareDistance(point, prevPoint) > this.sqTolerance) {
			newPoints.push(point);
			prevPoint = point;
		}
	}

	if (prevPoint !== point) {
		newPoints.push(point);
	}

	return newPoints;
};


// simplification using optimized Douglas-Peucker algorithm with recursion elimination

Simplify.prototype.simplifyDouglasPeucker = function (points) {

	var len = points.length,

		MarkerArray = (typeof Uint8Array !== undefined + '') ? Uint8Array : Array,

		markers = new MarkerArray(len),

		first = 0,
		last = len - 1,

		i,
		maxSqDist,
		sqDist,
		index,

		firstStack = [],
		lastStack = [],

		newPoints = [];

	markers[first] = markers[last] = 1;

	while (last) {

		maxSqDist = 0;

		for (i = first + 1; i < last; i++) {
			sqDist = getSquareSegmentDistance(points[i], points[first], points[last]);

			if (sqDist > maxSqDist) {
				index = i;
				maxSqDist = sqDist;
			}
		}

		if (maxSqDist > this.sqTolerance) {
			markers[index] = 1;

			firstStack.push(first);
			lastStack.push(index);

			firstStack.push(index);
			lastStack.push(last);
		}

		first = firstStack.pop();
		last = lastStack.pop();
	}

	for (i = 0; i < len; i++) {
		if (markers[i]) {
			newPoints.push(points[i]);
		}
	}

	return newPoints;
};


// both algorithms combined for awesome performance
function Simplify(tolerance, highestQuality){
	if (!(this instanceof Simplify)) {
		return new Simplify(tolerance, highestQuality);
	}
	var self = this;
	this.sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;
	if(highestQuality){
		self.points = self.simplifyDouglasPeucker;
	}else{
		self.points = function(points){
			return self.simplifyDouglasPeucker(self.simplifyRadialDistance(points));
		};
	}
}
module.exports = Simplify;
},{}],5:[function(require,module,exports){
var simplify = require('./simplify');


function SimplifyGeojson(num) {
	if (!(this instanceof SimplifyGeojson)) {
		return new SimplifyGeojson(num);
	}
	var func = simplify(num).points;
	this.func = function(a){
		return func(a);
	};
}
SimplifyGeojson.prototype.line = function(line) {
	return this.func(line);
};
SimplifyGeojson.prototype.multiLine = function(lnGroup) {
	return lnGroup.map(this.line, this);
};
SimplifyGeojson.prototype.multiPoly = function(multPoly) {
	return multPoly.map(this.multiLine, this);
};
SimplifyGeojson.prototype.geometries = function(geometries) {
	return geometries.map(this.geometry, this);
};
SimplifyGeojson.prototype.geometry = function(geometry) {
	var out = {};
	for (var key in geometry) {
		if (key !== 'coordinates' && key !== 'geometries') {
			out[key] = geometry[key];
		}
	}
	switch (geometry.type) {
	case "Point":
		out.coordinates = geometry.coordinates;
		return out;
	case "LineString":
		out.coordinates = this.line(geometry.coordinates);
		return out;
	case "MultiPoint":
		out.coordinates = geometry.coordinates;
		return out;
	case "MultiLineString":
		out.coordinates = this.multiLine(geometry.coordinates);
		return out;
	case "Polygon":
		out.coordinates = this.multiLine(geometry.coordinates);
		return out;
	case "MultiPolygon":
		out.coordinates = this.multiPoly(geometry.coordinates);
		return out;
	case "GeometryCollection":
		out.geometries = this.geometries(geometry.geometries);
		return out;
	}
};
SimplifyGeojson.prototype.feature = function(feature) {
	var out = {};
	for (var key in feature) {
		if (key !== 'geometry') {
			out[key] = feature[key];
		}
	}
	out.geometry = this.geometry(feature.geometry);
	return out;
};
SimplifyGeojson.prototype.featureCollection = function(fc) {
	var out = {};
	for (var key in fc) {
		if (key !== 'features') {
			out[key] = fc[key];
		}
	}
	out.features = fc.features.map(this.feature, this);
	return out;
};
SimplifyGeojson.prototype.any = function(thing) {
	if (Array.isArray(thing)) {
		return thing.map(this.any, this);
	}
	else if (thing.type === 'Feature') {
		return this.feature(thing);
	}
	else if (thing.type === 'FeatureCollection') {
		return this.featureCollection(thing);
	}
};

module.exports =SimplifyGeojson;
},{"./simplify":4}],6:[function(require,module,exports){
var proj = require('./quickProj');

function TransformGeojson(func) {
	if (!(this instanceof TransformGeojson)) {
		return new TransformGeojson(func);
	}
	this.func = func;
}
TransformGeojson.prototype.point = function(coord) {
	return this.func(coord);
};
TransformGeojson.prototype.line = function(line) {
	return line.map(this.point,this);
};
TransformGeojson.prototype.multiLine = function(lnGroup) {
	return lnGroup.map(this.line,this);
};
TransformGeojson.prototype.multiPoly = function(multPoly) {
	return multPoly.map(this.multiLine,this);
};
TransformGeojson.prototype.geometries = function(geometries) {
	return geometries.map(this.geometry,this);
};
TransformGeojson.prototype.bbox = function(bbox) {
	return this.point(bbox.slice(0, 2)).concat(this.point(bbox.slice(2)));
};
TransformGeojson.prototype.geometry = function(geometry) {
	var out = {};
	for (var key in geometry) {
		if (key === 'bbox') {
			out.bbox = this.bbox(geometry.bbox);
		}
		else if (key !== 'coordinates' && key !== 'geometries') {
			out[key] = geometry[key];
		}
	}
	switch (geometry.type) {
	case "Point":
		out.coordinates = this.point(geometry.coordinates);
		return out;
	case "LineString":
		out.coordinates = this.line(geometry.coordinates);
		return out;
	case "MultiPoint":
		out.coordinates = this.line(geometry.coordinates);
		return out;
	case "MultiLineString":
		out.coordinates = this.multiLine(geometry.coordinates);
		return out;
	case "Polygon":
		out.coordinates = this.multiLine(geometry.coordinates);
		return out;
	case "MultiPolygon":
		out.coordinates = this.multiPoly(geometry.coordinates);
		return out;
	case "GeometryCollection":
		out.geometries = this.geometries(geometry.geometries);
		return out;
	}
};
TransformGeojson.prototype.feature = function(feature) {
	var out = {};
	for (var key in feature) {
		if (key !== 'geometry') {
			out[key] = feature[key];
		}
	}
	out.geometry = this.geometry(feature.geometry);
	return out;
};
TransformGeojson.prototype.featureCollection = function(fc) {
	var out = {};
	for (var key in fc) {
		if (key === 'bbox') {
			out.bbox = this.bbox(fc.bbox);
		}
		else if (key !== 'features') {
			out[key] = fc[key];
		}
	}
	out.features = fc.features.map(this.feature, this);
	return out;
};
TransformGeojson.prototype.any = function(thing) {
	if (Array.isArray(thing)) {
		return thing.map(this.any, this);
	}
	else if (thing.type === 'Feature') {
		return this.feature(thing);
	}
	else if (thing.type === 'FeatureCollection') {
		return this.featureCollection(thing);
	}
};
exports.from = TransformGeojson(proj.project);
exports.to = TransformGeojson(proj.unproject);

},{"./quickProj":2}],7:[function(require,module,exports){
'use strict';
var rectangle = require('./rectangle');
var bbox = function(ar, obj) {
	if (obj && obj.bbox) {
		return {
			leaf: obj,
			x: obj.bbox[0],
			y: obj.bbox[1],
			w: obj.bbox[2] - obj.bbox[0],
			h: obj.bbox[3] - obj.bbox[1]
		};
	}
	var len = ar.length;
	var i = 0;
	var a = new Array(len);
	while (i < len) {
		a[i] = [ar[i][0], ar[i][1]];
		i++;
	}
	var first = a[0];
	len = a.length;
	i = 1;
	var temp = {
		min: [].concat(first),
		max: [].concat(first)
	};
	while (i < len) {
		if (a[i][0] < temp.min[0]) {
			temp.min[0] = a[i][0];
		}
		else if (a[i][0] > temp.max[0]) {
			temp.max[0] = a[i][0];
		}
		if (a[i][1] < temp.min[1]) {
			temp.min[1] = a[i][1];
		}
		else if (a[i][1] > temp.max[1]) {
			temp.max[1] = a[i][1];
		}
		i++;
	}
	var out = {
		x: temp.min[0],
		y: temp.min[1],
		w: (temp.max[0] - temp.min[0]),
		h: (temp.max[1] - temp.min[1])
	};
	if (obj) {
		out.leaf = obj;
	}
	return out;
};
var geoJSON = {};
geoJSON.point = function(obj, self) {
	return (self.insertSubtree({
		x: obj.geometry.coordinates[0],
		y: obj.geometry.coordinates[1],
		w: 0,
		h: 0,
		leaf: obj
	}, self.root));
};
geoJSON.multiPointLineString = function(obj, self) {
	return (self.insertSubtree(bbox(obj.geometry.coordinates, obj), self.root));
};
geoJSON.multiLineStringPolygon = function(obj, self) {
	return (self.insertSubtree(bbox(Array.prototype.concat.apply([], obj.geometry.coordinates), obj), self.root));
};
geoJSON.multiPolygon = function(obj, self) {
	return (self.insertSubtree(bbox(Array.prototype.concat.apply([], Array.prototype.concat.apply([], obj.geometry.coordinates)), obj), self.root));
};
geoJSON.makeRec = function(obj) {
	return rectangle(obj.x, obj.y, obj.w, obj.h);
};
geoJSON.geometryCollection = function(obj, self) {
	if (obj.bbox) {
		return (self.insertSubtree({
			leaf: obj,
			x: obj.bbox[0],
			y: obj.bbox[1],
			w: obj.bbox[2] - obj.bbox[0],
			h: obj.bbox[3] - obj.bbox[1]
		}, self.root));
	}
	var geos = obj.geometry.geometries;
	var i = 0;
	var len = geos.length;
	var temp = [];
	var g;
	while (i < len) {
		g = geos[i];
		switch (g.type) {
		case 'Point':
			temp.push(geoJSON.makeRec({
				x: g.coordinates[0],
				y: g.coordinates[1],
				w: 0,
				h: 0
			}));
			break;
		case 'MultiPoint':
			temp.push(geoJSON.makeRec(bbox(g.coordinates)));
			break;
		case 'LineString':
			temp.push(geoJSON.makeRec(bbox(g.coordinates)));
			break;
		case 'MultiLineString':
			temp.push(geoJSON.makeRec(bbox(Array.prototype.concat.apply([], g.coordinates))));
			break;
		case 'Polygon':
			temp.push(geoJSON.makeRec(bbox(Array.prototype.concat.apply([], g.coordinates))));
			break;
		case 'MultiPolygon':
			temp.push(geoJSON.makeRec(bbox(Array.prototype.concat.apply([], Array.prototype.concat.apply([], g.coordinates)))));
			break;
		case 'GeometryCollection':
			geos = geos.concat(g.geometries);
			len = geos.length;
			break;
		}
		i++;
	}
	var first = temp[0];
	i = 1;
	len = temp.length;
	while (i < len) {
		first.expand(temp[i]);
		i++;
	}
	return self.insertSubtree({
		leaf: obj,
		x: first.x(),
		y: first.y(),
		h: first.h(),
		w: first.w()
	}, self.root);
};
exports.geoJSON = function(prelim) {
	var that = this;
	var features, feature;
	if (Array.isArray(prelim)) {
		features = prelim.slice();
	}
	else if (prelim.features && Array.isArray(prelim.features)) {
		features = prelim.features.slice();
	}
	else {
		throw ('this isn\'t what we\'re looking for');
	}
	var len = features.length;
	var i = 0;
	while (i < len) {
		feature = features[i];
		if (feature.type === 'Feature') {
			switch (feature.geometry.type) {
			case 'Point':
				geoJSON.point(feature, that);
				break;
			case 'MultiPoint':
				geoJSON.multiPointLineString(feature, that);
				break;
			case 'LineString':
				geoJSON.multiPointLineString(feature, that);
				break;
			case 'MultiLineString':
				geoJSON.multiLineStringPolygon(feature, that);
				break;
			case 'Polygon':
				geoJSON.multiLineStringPolygon(feature, that);
				break;
			case 'MultiPolygon':
				geoJSON.multiPolygon(feature, that);
				break;
			case 'GeometryCollection':
				geoJSON.geometryCollection(feature, that);
				break;
			}
		}
		i++;
	}
};
exports.bbox = function() {
	var x1, y1, x2, y2;
	switch (arguments.length) {
	case 1:
		x1 = arguments[0][0][0];
		y1 = arguments[0][0][1];
		x2 = arguments[0][1][0];
		y2 = arguments[0][1][1];
		break;
	case 2:
		x1 = arguments[0][0];
		y1 = arguments[0][1];
		x2 = arguments[1][0];
		y2 = arguments[1][1];
		break;
	case 4:
		x1 = arguments[0];
		y1 = arguments[1];
		x2 = arguments[2];
		y2 = arguments[3];
		break;
	}

	return this.search({
		x: x1,
		y: y1,
		w: x2 - x1,
		h: y2 - y1
	});
};
},{"./rectangle":9}],8:[function(require,module,exports){
'use strict';
var geojson = require('./geojson');
var rectangle = require('./rectangle');
function RTree(width){
	if(!(this instanceof RTree)){
		return new RTree(width);
	}
	// Variables to control tree-dimensions
	var minWidth = 3;  // Minimum width of any node before a merge
	var maxWidth = 6;  // Maximum width of any node before a split
	if(!isNaN(width)){ minWidth = Math.floor(width/2.0); maxWidth = width;}
	// Start with an empty root-tree
	var rootTree = {x:0, y:0, w:0, h:0, id:'root', nodes:[] };
	this.root = rootTree;


	// This is my special addition to the world of r-trees
	// every other (simple) method I found produced crap trees
	// this skews insertions to prefering squarer and emptier nodes
	var flatten = function(tree){
		var todo = tree.slice();
		var done = [];
		var current;
		while(todo.length){
			current = todo.pop();
			if(current.nodes){
				todo=todo.concat(current.nodes);
			} else if (current.leaf) {
				done.push(current);
			}
		}
		return done;
	};
	/* find the best specific node(s) for object to be deleted from
	 * [ leaf node parent ] = removeSubtree(rectangle, object, root)
	 * @private
	 */
	var removeSubtree = function(rect, obj, root) {
		var hitStack = []; // Contains the elements that overlap
		var countStack = []; // Contains the elements that overlap
		var retArray = [];
		var currentDepth = 1;
		var tree, i,ltree;
		if(!rect || !rectangle.overlapRectangle(rect, root)){
			return retArray;
		}
		var retObj = {x:rect.x, y:rect.y, w:rect.w, h:rect.h, target:obj};
		
		countStack.push(root.nodes.length);
		hitStack.push(root);
		while(hitStack.length > 0) {
			tree = hitStack.pop();
			i = countStack.pop()-1;
			if('target' in retObj) { // will this ever be false?
				while(i >= 0){
					ltree = tree.nodes[i];
					if(rectangle.overlapRectangle(retObj, ltree)) {
						if( (retObj.target && 'leaf' in ltree && ltree.leaf === retObj.target) ||(!retObj.target && ('leaf' in ltree || rectangle.containsRectangle(ltree, retObj)))) {
							// A Match !!
						// Yup we found a match...
						// we can cancel search and start walking up the list
							if('nodes' in ltree) {// If we are deleting a node not a leaf...
								retArray = flatten(tree.nodes.splice(i, 1));
							} else {
								retArray = tree.nodes.splice(i, 1);
							}
							// Resize MBR down...
							rectangle.makeMBR(tree.nodes, tree);
							delete retObj.target;
							//if(tree.nodes.length < minWidth) { // Underflow
							//	retObj.nodes = searchSubtree(tree, true, [], tree);
							//}
							break;
						}else if('nodes' in ltree) { // Not a Leaf
							currentDepth++;
							countStack.push(i);
							hitStack.push(tree);
							tree = ltree;
							i = ltree.nodes.length;
						}
					}
					i--;
				}
				
			} else if('nodes' in retObj) { // We are unsplitting
			
				tree.nodes.splice(i+1, 1); // Remove unsplit node
				if(tree.nodes.length > 0){
					rectangle.makeMBR(tree.nodes, tree);
				}
				for(var t = 0;t<retObj.nodes.length;t++){
					insertSubtree(retObj.nodes[t], tree);
				}
				retObj.nodes = [];
				if(hitStack.length === 0 && tree.nodes.length <= 1) { // Underflow..on root!
					retObj.nodes = searchSubtree(tree, true, retObj.nodes, tree);
					tree.nodes = [];
					hitStack.push(tree);
					countStack.push(1);
				} else if(hitStack.length > 0 && tree.nodes.length < minWidth) { // Underflow..AGAIN!
					retObj.nodes = searchSubtree(tree, true, retObj.nodes, tree);
					tree.nodes = [];
				}else {
					delete retObj.nodes; // Just start resizing
				}
			} else { // we are just resizing
				rectangle.makeMBR(tree.nodes, tree);
			}
			currentDepth -= 1;
		}
		return retArray;
	};

	/* choose the best damn node for rectangle to be inserted into
	 * [ leaf node parent ] = chooseLeafSubtree(rectangle, root to start search at)
	 * @private
	 */
	var chooseLeafSubtree = function(rect, root) {
		var bestChoiceIndex = -1;
		var bestChoiceStack = [];
		var bestChoiceArea;
		var first=true;
		bestChoiceStack.push(root);
		var nodes = root.nodes;

		while(first || bestChoiceIndex !== -1) {
			if(first) {
				first = false;
			} else {
				bestChoiceStack.push(nodes[bestChoiceIndex]);
				nodes = nodes[bestChoiceIndex].nodes;
				bestChoiceIndex = -1;
			}
	
			for(var i = nodes.length-1; i >= 0; i--) {
				var ltree = nodes[i];
				if('leaf' in ltree) {
					// Bail out of everything and start inserting
					bestChoiceIndex = -1;
					break;
				}
				// Area of new enlarged rectangle
				var oldLRatio = rectangle.squarifiedRatio(ltree.w, ltree.h, ltree.nodes.length+1);

				// Enlarge rectangle to fit new rectangle
				var nw = Math.max(ltree.x+ltree.w, rect.x+rect.w) - Math.min(ltree.x, rect.x);
				var nh = Math.max(ltree.y+ltree.h, rect.y+rect.h) - Math.min(ltree.y, rect.y);
			
				// Area of new enlarged rectangle
				var lratio = rectangle.squarifiedRatio(nw, nh, ltree.nodes.length+2);
				
				if(bestChoiceIndex < 0 || Math.abs(lratio - oldLRatio) < bestChoiceArea) {
					bestChoiceArea = Math.abs(lratio - oldLRatio); bestChoiceIndex = i;
				}
			}
		}

		return bestChoiceStack;
	};

	/* split a set of nodes into two roughly equally-filled nodes
	 * [ an array of two new arrays of nodes ] = linearSplit(array of nodes)
	 * @private
	 */
	var linearSplit = function(nodes) {
		var n = pickLinear(nodes);
		while(nodes.length > 0)	{
			pickNext(nodes, n[0], n[1]);
		}
		return n;
	};
	
	/* insert the best source rectangle into the best fitting parent node: a or b
	 * [] = pickNext(array of source nodes, target node array a, target node array b)
	 * @private
	 */
	var pickNext = function(nodes, a, b) {
	// Area of new enlarged rectangle
		var areaA = rectangle.squarifiedRatio(a.w, a.h, a.nodes.length+1);
		var areaB = rectangle.squarifiedRatio(b.w, b.h, b.nodes.length+1);
		var highAreaDelta;
		var highAreaNode;
		var lowestGrowthGroup;
		
		for(var i = nodes.length-1; i>=0;i--) {
			var l = nodes[i];
			var newAreaA = {};
			newAreaA.x = Math.min(a.x, l.x); newAreaA.y = Math.min(a.y, l.y);
			newAreaA.w = Math.max(a.x+a.w, l.x+l.w) - newAreaA.x;	newAreaA.h = Math.max(a.y+a.h, l.y+l.h) - newAreaA.y;
			var changeNewAreaA = Math.abs(rectangle.squarifiedRatio(newAreaA.w, newAreaA.h, a.nodes.length+2) - areaA);
	
			var newAreaB = {};
			newAreaB.x = Math.min(b.x, l.x); newAreaB.y = Math.min(b.y, l.y);
			newAreaB.w = Math.max(b.x+b.w, l.x+l.w) - newAreaB.x;	newAreaB.h = Math.max(b.y+b.h, l.y+l.h) - newAreaB.y;
			var changeNewAreaB = Math.abs(rectangle.squarifiedRatio(newAreaB.w, newAreaB.h, b.nodes.length+2) - areaB);

			if( !highAreaNode || !highAreaDelta || Math.abs( changeNewAreaB - changeNewAreaA ) < highAreaDelta ) {
				highAreaNode = i;
				highAreaDelta = Math.abs(changeNewAreaB-changeNewAreaA);
				lowestGrowthGroup = changeNewAreaB < changeNewAreaA ? b : a;
			}
		}
		var tempNode = nodes.splice(highAreaNode, 1)[0];
		if(a.nodes.length + nodes.length + 1 <= minWidth)	{
			a.nodes.push(tempNode);
			rectangle.expandRectangle(a, tempNode);
		}	else if(b.nodes.length + nodes.length + 1 <= minWidth) {
			b.nodes.push(tempNode);
			rectangle.expandRectangle(b, tempNode);
		}
		else {
			lowestGrowthGroup.nodes.push(tempNode);
			rectangle.expandRectangle(lowestGrowthGroup, tempNode);
		}
	};
	
	/* pick the 'best' two starter nodes to use as seeds using the 'linear' criteria
	 * [ an array of two new arrays of nodes ] = pickLinear(array of source nodes)
	 * @private
	 */
	var pickLinear = function(nodes) {
		var lowestHighX = nodes.length-1;
		var highestLowX = 0;
		var lowestHighY = nodes.length-1;
		var highestLowY = 0;
		var t1, t2;
		
		for(var i = nodes.length-2; i>=0;i--){
			var l = nodes[i];
			if(l.x > nodes[highestLowX].x ){
				highestLowX = i;
			}else if(l.x+l.w < nodes[lowestHighX].x+nodes[lowestHighX].w){
				lowestHighX = i;
			}
			if(l.y > nodes[highestLowY].y ){
				highestLowY = i;
			}else if(l.y+l.h < nodes[lowestHighY].y+nodes[lowestHighY].h){
				lowestHighY = i;
			}
		}
		var dx = Math.abs((nodes[lowestHighX].x+nodes[lowestHighX].w) - nodes[highestLowX].x);
		var dy = Math.abs((nodes[lowestHighY].y+nodes[lowestHighY].h) - nodes[highestLowY].y);
		if( dx > dy )	{
			if(lowestHighX > highestLowX)	{
				t1 = nodes.splice(lowestHighX, 1)[0];
				t2 = nodes.splice(highestLowX, 1)[0];
			}	else {
				t2 = nodes.splice(highestLowX, 1)[0];
				t1 = nodes.splice(lowestHighX, 1)[0];
			}
		}	else {
			if(lowestHighY > highestLowY)	{
				t1 = nodes.splice(lowestHighY, 1)[0];
				t2 = nodes.splice(highestLowY, 1)[0];
			}	else {
				t2 = nodes.splice(highestLowY, 1)[0];
				t1 = nodes.splice(lowestHighY, 1)[0];
			}
		}
		return [
			{x:t1.x, y:t1.y, w:t1.w, h:t1.h, nodes:[t1]},
			{x:t2.x, y:t2.y, w:t2.w, h:t2.h, nodes:[t2]}
		];
	};
	
	var attachData = function(node, moreTree){
		node.nodes = moreTree.nodes;
		node.x = moreTree.x; node.y = moreTree.y;
		node.w = moreTree.w; node.h = moreTree.h;
		return node;
	};

	/* non-recursive internal search function
	* [ nodes | objects ] = searchSubtree(rectangle, [return node data], [array to fill], root to begin search at)
	 * @private
	 */
	var searchSubtree = function(rect, returnNode, returnArray, root) {
		var hitStack = []; // Contains the elements that overlap
	
		if(!rectangle.overlapRectangle(rect, root)){
			return returnArray;
		}
	
	
		hitStack.push(root.nodes);
	
		while(hitStack.length > 0){
			var nodes = hitStack.pop();
	
			for(var i = nodes.length-1; i >= 0; i--) {
				var ltree = nodes[i];
				if(rectangle.overlapRectangle(rect, ltree)) {
					if('nodes' in ltree) { // Not a Leaf
						hitStack.push(ltree.nodes);
					} else if('leaf' in ltree) { // A Leaf !!
						if(!returnNode) {
							returnArray.push(ltree.leaf);
						} else {
							returnArray.push(ltree);
						}
					}
				}
			}
		}
		
		return returnArray;
	};
	
	/* non-recursive internal insert function
	 * [] = insertSubtree(rectangle, object to insert, root to begin insertion at)
	 * @private
	 */
	var insertSubtree = function(node, root) {
		var bc; // Best Current node
		// Initial insertion is special because we resize the Tree and we don't
		// care about any overflow (seriously, how can the first object overflow?)
		if(root.nodes.length === 0) {
			root.x = node.x; root.y = node.y;
			root.w = node.w; root.h = node.h;
			root.nodes.push(node);
			return;
		}
		
		// Find the best fitting leaf node
		// chooseLeaf returns an array of all tree levels (including root)
		// that were traversed while trying to find the leaf
		var treeStack = chooseLeafSubtree(node, root);
		var retObj = node;//{x:rect.x,y:rect.y,w:rect.w,h:rect.h, leaf:obj};
		var pbc;
		// Walk back up the tree resizing and inserting as needed
		while(treeStack.length > 0) {
			//handle the case of an empty node (from a split)
			if(bc && 'nodes' in bc && bc.nodes.length === 0) {
				pbc = bc; // Past bc
				bc = treeStack.pop();
				for(var t=0;t<bc.nodes.length;t++){
					if(bc.nodes[t] === pbc || bc.nodes[t].nodes.length === 0) {
						bc.nodes.splice(t, 1);
						break;
					}
				}
			} else {
				bc = treeStack.pop();
			}
			
			// If there is data attached to this retObj
			if('leaf' in retObj || 'nodes' in retObj || Array.isArray(retObj)) {
				// Do Insert
				if(Array.isArray(retObj)) {
					for(var ai = 0; ai < retObj.length; ai++) {
						rectangle.expandRectangle(bc, retObj[ai]);
					}
					bc.nodes = bc.nodes.concat(retObj);
					} else {
					rectangle.expandRectangle(bc, retObj);
					bc.nodes.push(retObj); // Do Insert
				}
	
				if(bc.nodes.length <= maxWidth)	{ // Start Resizeing Up the Tree
					retObj = {x:bc.x,y:bc.y,w:bc.w,h:bc.h};
				}	else { // Otherwise Split this Node
					// linearSplit() returns an array containing two new nodes
					// formed from the split of the previous node's overflow
					var a = linearSplit(bc.nodes);
					retObj = a;//[1];
					
					if(treeStack.length < 1)	{ // If are splitting the root..
						bc.nodes.push(a[0]);
						treeStack.push(bc);	// Reconsider the root element
						retObj = a[1];
					} /*else {
						delete bc;
					}*/
				}
			} else { // Otherwise Do Resize
				//Just keep applying the new bounding rectangle to the parents..
				rectangle.expandRectangle(bc, retObj);
				retObj = {x:bc.x,y:bc.y,w:bc.w,h:bc.h};
			}
		}
	};

	this.insertSubtree = insertSubtree;
	/* quick 'n' dirty function for plugins or manually drawing the tree
	 * [ tree ] = RTree.getTree(): returns the raw tree data. useful for adding
	 * @public
	 * !! DEPRECATED !!
	 */
	this.getTree = function() {
		return rootTree;
	};
	
	/* quick 'n' dirty function for plugins or manually loading the tree
	 * [ tree ] = RTree.setTree(sub-tree, where to attach): returns the raw tree data. useful for adding
	 * @public
	 * !! DEPRECATED !!
	 */
	this.setTree = function(newTree, where) {
		if(!where){
			where = rootTree;
		}
		return attachData(where, newTree);
	};
	
	/* non-recursive search function
	* [ nodes | objects ] = RTree.search(rectangle, [return node data], [array to fill])
	 * @public
	 */
	this.search = function(rect, returnNode, returnArray) {
		returnArray = returnArray||[];
		return searchSubtree(rect,returnNode,returnArray,rootTree);
	};
		
	
	var removeArea = function(rect){
		var numberDeleted = 1,
		retArray = [],
		deleted;
		while( numberDeleted > 0) {
			deleted = removeSubtree(rect,false,rootTree);
			numberDeleted = deleted.length;
			retArray = retArray.concat(deleted);
		}
			return retArray;
	};
	
	var removeObj=function(rect,obj){
		var retArray = removeSubtree(rect,obj,rootTree);
		return retArray;
	};
		/* non-recursive delete function
	 * [deleted object] = RTree.remove(rectangle, [object to delete])
	 */
	this.remove = function(rect, obj) {
		if(!obj||typeof obj==='function'){
			return removeArea(rect,obj);
		}else{
			return removeObj(rect,obj);
		}
	};
		
	/* non-recursive insert function
	 * [] = RTree.insert(rectangle, object to insert)
	 */
	this.insert = function(rect, obj) {
		var retArray = insertSubtree({x:rect.x,y:rect.y,w:rect.w,h:rect.h,leaf:obj}, rootTree);
		return retArray;
	};
}
RTree.prototype.toJSON = function(printing) {
	return JSON.stringify(this.root, false, printing);
};

RTree.fromJSON = function(json) {
	var rt = new RTree();
	rt.setTree(JSON.parse(json));
	return rt;
};
RTree.prototype.bbox = geojson.bbox;
RTree.prototype.geoJSON = geojson.geoJSON;
RTree.Rectangle = rectangle;
module.exports = RTree;



},{"./geojson":7,"./rectangle":9}],9:[function(require,module,exports){
'use strict';
function Rectangle(x, y, w, h) { // new Rectangle(bounds) or new Rectangle(x, y, w, h)
	if (!(this instanceof Rectangle)) {
		return new Rectangle(x, y, w, h);
	}
	var x2, y2, p;

	if (x.x) {
		w = x.w;
		h = x.h;
		y = x.y;
		if (x.w !== 0 && !x.w && x.x2) {
			w = x.x2 - x.x;
			h = x.y2 - x.y;
		}
		else {
			w = x.w;
			h = x.h;
		}
		x = x.x;
		// For extra fastitude
		x2 = x + w;
		y2 = y + h;
		p = (h + w) ? false : true;
	}
	else {
		// For extra fastitude
		x2 = x + w;
		y2 = y + h;
		p = (h + w) ? false : true;
	}

	this.x1 = this.x = function() {
		return x;
	};
	this.y1 = this.y = function() {
		return y;
	};
	this.x2 = function() {
		return x2;
	};
	this.y2 = function() {
		return y2;
	};
	this.w = function() {
		return w;
	};
	this.h = function() {
		return h;
	};
	this.p = function() {
		return p;
	};

	this.overlap = function(a) {
		if (p || a.p()) {
			return x <= a.x2() && x2 >= a.x() && y <= a.y2() && y2 >= a.y();
		}
		return x < a.x2() && x2 > a.x() && y < a.y2() && y2 > a.y();
	};

	this.expand = function(a) {
		var nx, ny;
		var ax = a.x();
		var ay = a.y();
		var ax2 = a.x2();
		var ay2 = a.y2();
		if (x > ax) {
			nx = ax;
		}
		else {
			nx = x;
		}
		if (y > ay) {
			ny = ay;
		}
		else {
			ny = y;
		}
		if (x2 > ax2) {
			w = x2 - nx;
		}
		else {
			w = ax2 - nx;
		}
		if (y2 > ay2) {
			h = y2 - ny;
		}
		else {
			h = ay2 - ny;
		}
		x = nx;
		y = ny;
		return this;
	};

	//End of RTree.Rectangle
}


/* returns true if rectangle 1 overlaps rectangle 2
 * [ boolean ] = overlapRectangle(rectangle a, rectangle b)
 * @static function
 */
Rectangle.overlapRectangle = function(a, b) {
	//if(!((a.h||a.w)&&(b.h||b.w))){ not faster resist the urge!
	if ((a.h === 0 && a.w === 0) || (b.h === 0 && b.w === 0)) {
		return a.x <= (b.x + b.w) && (a.x + a.w) >= b.x && a.y <= (b.y + b.h) && (a.y + a.h) >= b.y;
	}
	else {
		return a.x < (b.x + b.w) && (a.x + a.w) > b.x && a.y < (b.y + b.h) && (a.y + a.h) > b.y;
	}
};

/* returns true if rectangle a is contained in rectangle b
 * [ boolean ] = containsRectangle(rectangle a, rectangle b)
 * @static function
 */
Rectangle.containsRectangle = function(a, b) {
	return (a.x + a.w) <= (b.x + b.w) && a.x >= b.x && (a.y + a.h) <= (b.y + b.h) && a.y >= b.y;
};

/* expands rectangle A to include rectangle B, rectangle B is untouched
 * [ rectangle a ] = expandRectangle(rectangle a, rectangle b)
 * @static function
 */
Rectangle.expandRectangle = function(a, b) {
	var nx, ny;
	var axw = a.x + a.w;
	var bxw = b.x + b.w;
	var ayh = a.y + a.h;
	var byh = b.y + b.h;
	if (a.x > b.x) {
		nx = b.x;
	}
	else {
		nx = a.x;
	}
	if (a.y > b.y) {
		ny = b.y;
	}
	else {
		ny = a.y;
	}
	if (axw > bxw) {
		a.w = axw - nx;
	}
	else {
		a.w = bxw - nx;
	}
	if (ayh > byh) {
		a.h = ayh - ny;
	}
	else {
		a.h = byh - ny;
	}
	a.x = nx;
	a.y = ny;
	return a;
};

/* generates a minimally bounding rectangle for all rectangles in
 * array 'nodes'. If rect is set, it is modified into the MBR. Otherwise,
 * a new rectangle is generated and returned.
 * [ rectangle a ] = makeMBR(rectangle array nodes, rectangle rect)
 * @static function
 */
Rectangle.makeMBR = function(nodes, rect) {
	if (!nodes.length) {
		return {
			x: 0,
			y: 0,
			w: 0,
			h: 0
		};
	}
	rect = rect || {};
	rect.x = nodes[0].x;
	rect.y = nodes[0].y;
	rect.w = nodes[0].w;
	rect.h = nodes[0].h;

	for (var i = 1, len = nodes.length; i < len; i++) {
		Rectangle.expandRectangle(rect, nodes[i]);
	}

	return rect;
};
Rectangle.squarifiedRatio = function(l, w, fill) {
	// Area of new enlarged rectangle
	var lperi = (l + w) / 2.0; // Average size of a side of the new rectangle
	var larea = l * w; // Area of new rectangle
	// return the ratio of the perimeter to the area - the closer to 1 we are,
	// the more 'square' a rectangle is. conversly, when approaching zero the
	// more elongated a rectangle is
	var lgeo = larea / (lperi * lperi);
	return larea * fill / lgeo;
};
module.exports = Rectangle;
},{}]},{},[1])
(1)
});
;