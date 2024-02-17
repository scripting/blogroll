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
	
	const theBlogroll = new blogroll ({
		whereToAppend: $(".divBlogrollContainer"),
		urlFeedListOpml: "http://scripting.com/publicfolder/feedland/subscriptionLists/wordSocialStarters.opml" //includes doc, zeldman, manton, me and wp-special-projects -- 2/10/24 by DW
		});
	
	
	self.setInterval (everySecond, 1000); 
	}
