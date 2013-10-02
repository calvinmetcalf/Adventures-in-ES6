const proj = require('./quickProj');

class TransformGeojson {
	constructor(func) {
		if (!(this instanceof TransformGeojson)) {
			return new TransformGeojson(func);
		}
		this.func = func;
	}
	point(coord) {
		return this.func(coord);
	}
	line(line) {
		return line.map(this.point);
	}
	multiLine(lnGroup) {
		return lnGroup.map(this.line);
	}
	multiPoly(multPoly) {
		return multPoly.map(this.multiLine);
	}
	geometries(geometries) {
		return geometries.map(this.geometry);
	}
	bbox(bbox) {
		return this.point(bbox.slice(0, 2)).concat(this.point(bbox.slice(2)));
	}
	geometry(geometry) {
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
	}
	feature(feature) {
		var out = {};
		for (var key in feature) {
			if (key !== 'geometry') {
				out[key] = feature[key];
			}
		}
		out.geometry = this.geometry(feature.geometry);
		return out;
	}
	featureCollection(fc) {
		var out = {};
		for (var key in fc) {
			if (key === 'bbox') {
				out.bbox = this.bbox(fc.bbox);
			}
			else if (key !== 'features') {
				out[key] = fc[key];
			}
		}
		out.features = fc.features.map(this.feature);
		return out;
	}
	any(thing) {
		if (Array.isArray(thing)) {
			return thing.map(this.any);
		}
		else if (thing.type === 'Feature') {
			return this.feature(thing);
		}
		else if (thing.type === 'FeatureCollection') {
			return this.featureCollection(thing);
		}
	}
}
var from = TransformGeojson(proj.project);
var to = TransformGeojson(proj.unproject);

exports.from = something => from.any(something)
exports.to = something => to.any(something)
