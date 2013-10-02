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
var rtree = require('rtree');
var trans = require('./transform');
var rt = function() {
  'use strict';
  var $rt = ($__createClassNoExtends)({constructor: function() {
      this.tree = rtree();
    }}, {});
  return $rt;
}();
