var mlat = 85.0511287798;
var d2r = Math.PI / 180;
var r2d = 180 / Math.PI;
exports.project = (function(latlng) {
  return [$traceurRuntime.elementGet(latlng, 0) * d2r, Math.log(Math.tan((Math.PI / 4) + (Math.max(Math.min(mlat, $traceurRuntime.elementGet(latlng, 1)), - mlat) * d2r / 2)))];
});
exports.unproject = (function(point) {
  return [$traceurRuntime.elementGet(point, 0) * r2d, (2 * Math.atan(Math.exp($traceurRuntime.elementGet(point, 1))) - (Math.PI / 2)) * r2d];
});
