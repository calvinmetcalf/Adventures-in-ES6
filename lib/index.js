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