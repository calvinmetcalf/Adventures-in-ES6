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