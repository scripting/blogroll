const appConsts = {
	urlFeedlandServer: "https://feedland.com/",
	
	urlSocketServer: "wss://feedland.com:443/_ws/",
	
	flShowSocketMessages: true,
	flBlogrollUpdates: true,
	};

function everySecond () {
	}
function startup () {
	console.log ("startup");
	hitCounter ();
	startBlogroll ();
	self.setInterval (everySecond, 1000); 
	}
