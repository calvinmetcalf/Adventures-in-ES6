//from https://github.com/Leaflet/Leaflet/blob/master/src/geo/projection/Projection.SphericalMercator.js
const mlat = 85.0511287798;
const d2r = Math.PI / 180;
const r2d = 180 / Math.PI;
exports.project = latlng => [latlng[0] * d2r, Math.log(Math.tan((Math.PI / 4) + (Math.max(Math.min(mlat, latlng[1]), -mlat) * d2r / 2)))]
exports.unproject = point =>  [point[0] * r2d, (2 * Math.atan(Math.exp(point[1])) - (Math.PI / 2)) * r2d]
