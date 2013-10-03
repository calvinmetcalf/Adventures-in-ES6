module.exports = function(quantizaiton){
	return function(bounds){
		var metric = Math.max(Math.abs(bounds[0][0]-bounds[1][0]),Math.abs(bounds[0][1]-bounds[1][1]))/quantizaiton;
		console.log(metric);
		return metric;
	};
};