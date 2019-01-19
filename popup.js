let openmaps = document.getElementById('openmaps');


function getLatLonZoom(url){
	map_url = url;
	if (map_url.match(/(www\.openstreetmap)/)){
		[is_supported_url, zoom, lat, lon] = map_url.match(/map=(\d{1,2})\/(-?\d[0-9.]*)\/(-?\d[0-9.]*)/);
	}else if(map_url.match(/(google).*(maps).*z/)){
		[is_supported_url, lat, lon, zoom] = map_url.match(/@(-?\d[0-9.]*),(-?\d[0-9.]*),(\d{1,2})[.z]/);
	}else if(map_url.match(/(google).*(maps).*(1e3)$/)){
		[is_supported_url, lat, lon, zoom] = map_url.match(/@(-?\d[0-9.]*),(-?\d[0-9.]*),(\d[0-9.]*)[.m]/);
		zoom = -1.4436*Math.log(zoom)+26.871;
	}else if(map_url.match(/(mapillary)/)){
		[is_supported_url, lat, lon, zoom] = map_url.match(/lat=(-?\d[0-9.]*)&lng=(-?\d[0-9.]*)&z=(\d{1,2})/);
	}else if(map_url.match(/(openstreetcam)/)){
		[is_supported_url, lat, lon, zoom] = map_url.match(/@(-?\d[0-9.]*),(-?\d[0-9.]*),(\d{1,2})/);
	}else if(map_url.match(/(maps\.gsi\.go\.jp)/)){
		[is_supported_url, zoom, lat, lon] = map_url.match(/#(\d{1,2})\/(-?\d[0-9.]*)\/(-?\d[0-9.]*)/);
	}else if(map_url.match(/(yandex).*(maps)/)){
		[is_supported_url, lon, lat, zoom] = map_url.match(/ll=(-?\d[0-9.]*)%2C(-?\d[0-9.]*)&z=(\d{1,2})/);
	}else if(map_url.match(/(demo\.f4map\.com)/)){
		[is_supported_url, lat, lon, zoom] = map_url.match(/#lat=(-?\d[0-9.]*)&lon=(-?\d[0-9.]*)&zoom=(\d{1,2})/);
	}
	
	return [lat, lon, zoom];

};




openmaps.onclick = function(element) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		[lat, lon, zoom] = getLatLonZoom(tabs[0].url);
		chrome.runtime.sendMessage({message:'openmaps', url: tabs[0].url, lat: lat, lon: lon, zoom: zoom}, function(response){
			console.log("Received: ", response);
		});
			
			//alert(id);
			window.close();
		});
}; 

