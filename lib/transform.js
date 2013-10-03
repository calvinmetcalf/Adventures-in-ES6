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
