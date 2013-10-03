
var layer = L.geoJson(undefined, {
	style: style,
	onEachFeature: onEachFeature
}).addTo(m);
var rt = cw({
	size:Math.max(m.getSize().x,m.getSize().y),
	init:function(self){
		importScripts('dist/ws.js');
		self.tree = rtree(self.size);
		console.log(self.size);
	},
	insert:function(data,cb,self){
		self.tree.insert(data);
		return true;
	},
	get:function(bounds,cb,self){
		return self.tree.get(bounds);
	},
	listners:{
		console:function(d){
			console.log(d);
		}
	}
});


L.Util.ajax("bikes.geojson").then(function(data) {
	rt.insert(data).then(function(){
		console.log('inserted');
		showAll();
	},function(err){
		console.warn(err);
	});
});


 //add it
m.on("boxselectend", function(e) {
	layer.clearLayers();
	rt.get(e.boxSelectBounds).then(function(data){
		layer.addData(data);
	},function(err){
		console.warn(err);
	});
});

function showAll() {
	layer.clearLayers();
	var bounds = m.getBounds();
	rt.get([
		[bounds.getSouthWest().lng, bounds.getSouthWest().lat],
		[bounds.getNorthEast().lng, bounds.getNorthEast().lat]
	]).then(function(data){
		layer.addData(data);
	},function(err){
		console.warn(err);
	});
	
}
m.on("contextmenu moveend", showAll);
