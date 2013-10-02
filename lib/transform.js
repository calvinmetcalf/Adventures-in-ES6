var $__getDescriptors = function(object) {
  var descriptors = {}, name, names = Object.getOwnPropertyNames(object);
  for (var i = 0; i < names.length; i++) {
    var name = $traceurRuntime.elementGet(names, i);
    $traceurRuntime.elementSet(descriptors, name, Object.getOwnPropertyDescriptor(object, name));
  }
  return descriptors;
}, $__createClassNoExtends = function(object, staticObject) {
  var ctor = object.constructor;
  Object.defineProperty(object, 'constructor', {enumerable: false});
  ctor.prototype = object;
  Object.defineProperties(ctor, $__getDescriptors(staticObject));
  return ctor;
};
var proj = require('./quickProj');
var TransformGeojson = function() {
  'use strict';
  var $TransformGeojson = ($__createClassNoExtends)({
    constructor: function(func) {
      if (!(this instanceof TransformGeojson)) {
        return new TransformGeojson(func);
      }
      this.func = func;
    },
    point: function(coord) {
      return this.func(coord);
    },
    line: function(line) {
      return line.map(this.point);
    },
    multiLine: function(lnGroup) {
      return lnGroup.map(this.line);
    },
    multiPoly: function(multPoly) {
      return multPoly.map(this.multiLine);
    },
    geometries: function(geometries) {
      return geometries.map(this.geometry);
    },
    bbox: function(bbox) {
      return this.point(bbox.slice(0, 2)).concat(this.point(bbox.slice(2)));
    },
    geometry: function(geometry) {
      var out = {};
      for (var key in geometry) {
        if (key === 'bbox') {
          out.bbox = this.bbox(geometry.bbox);
        } else if (key !== 'coordinates' && key !== 'geometries') {
          $traceurRuntime.elementSet(out, key, $traceurRuntime.elementGet(geometry, key));
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
    },
    feature: function(feature) {
      var out = {};
      for (var key in feature) {
        if (key !== 'geometry') {
          $traceurRuntime.elementSet(out, key, $traceurRuntime.elementGet(feature, key));
        }
      }
      out.geometry = this.geometry(feature.geometry);
      return out;
    },
    featureCollection: function(fc) {
      var out = {};
      for (var key in fc) {
        if (key === 'bbox') {
          out.bbox = this.bbox(fc.bbox);
        } else if (key !== 'features') {
          $traceurRuntime.elementSet(out, key, $traceurRuntime.elementGet(fc, key));
        }
      }
      out.features = fc.features.map(this.feature);
      return out;
    },
    any: function(thing) {
      if (Array.isArray(thing)) {
        return thing.map(this.any);
      } else if (thing.type === 'Feature') {
        return this.feature(thing);
      } else if (thing.type === 'FeatureCollection') {
        return this.featureCollection(thing);
      }
    }
  }, {});
  return $TransformGeojson;
}();
var from = TransformGeojson(proj.project);
var to = TransformGeojson(proj.unproject);
exports.from = (function(something) {
  return from.any(something);
});
exports.to = (function(something) {
  return to.any(something);
});
