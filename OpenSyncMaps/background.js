let mapATabId, mapBTabId;
let currentLat, currentLon, currentZoom;

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

chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [
			new chrome.declarativeContent.PageStateMatcher({pageUrl: {urlMatches: 'google.*maps'},}),
			new chrome.declarativeContent.PageStateMatcher({pageUrl: {hostEquals: 'www.openstreetmap.org'},})
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
});


 chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	//console.log(tabId, changeInfo);
	if (changeInfo.status=='complete'){

		if (tabId==mapATabId){
			[lat, lon, zoom] = getLatLonZoom(tab.url);
			if (Number(lat) != Number(currentLat) || Number(lon) != Number(currentLon) || Number(zoom) != Number(currentZoom)) {
				currentLat = lat; currentLon = lon; currentZoom = zoom;
				chrome.tabs.update(mapBTabId,
				{
					url:'https://www.openstreetmap.org/#map=' + zoom + '/' + lat + '/' + lon
				});
			};

			//console.log("mapA:", tab.url);
		}
		else if (tabId==mapBTabId){
			[lat, lon, zoom] = getLatLonZoom(tab.url);
			url = 'https://www.google.co.jp/maps/@' + lat + ',' + lon + ',' + zoom + 'z';
			if (Number(lat) != Number(currentLat) || Number(lon) != Number(currentLon) || Number(zoom) != Number(currentZoom))  {
				currentLat = lat; currentLon = lon; currentZoom = zoom;
				chrome.tabs.update(mapATabId,
				{
					url:'https://www.google.co.jp/maps/@' + lat + ',' + lon + ',' + zoom + 'z'
				});
			};

		}
		else {};
	};
 });
 
 chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
	//console.log(message);
	if (message.message=='openmaps'){
			chrome.windows.create({
				url: 'https://www.google.co.jp/maps/@' + message.lat + ',' + message.lon + ',' + message.zoom + 'z',
				height: screen.availHeight,
				width: screen.availWidth/2,
				top: 0,
				left: 0
			}, function(window){
				//console.log(window.tabs);
				mapATabId = window.tabs[0].id;
				//console.log('WindowA:', window.id);
			});	
			chrome.windows.create({
				url: 'https://www.openstreetmap.org/#map=' + message.zoom + '/' + message.lat + '/' + message.lon,
				height: screen.availHeight,
				width: screen.availWidth/2,
				top: 0,
				left: screen.availWidth/2+1
			}, function(window){
				//console.log(window.tabs);
				mapBTabId = window.tabs[0].id;
				//console.log('Window B:', window.id);
			});
	};

	sendResponse("back message");

	 return true;
 })
 
 