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
