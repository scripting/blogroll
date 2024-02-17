const appConsts = {
	urlFeedlandServer: "https://feedland.com/",
	
	urlSocketServer: "wss://feedland.com:443/_ws/",
	
	urlFeedListOpml: "http://scripting.com/publicfolder/feedland/subscriptionLists/wordSocialStarters.opml", //includes doc, zeldman, manton, me and wp-special-projects -- 2/10/24 by DW
	
	flShowSocketMessages: true,
	flBlogrollUpdates: true,
	};


var blogrollMemory = {
	ixcursor: 0
	}

function saveBlogrollMemory () {
	localStorage.blogrollMemory = jsonStringify (blogrollMemory);
	}

function everySecond () {
	}
function startup () {
	console.log ("startup");
	hitCounter ();
	
	if (localStorage.blogrollMemory !== undefined) {
		try {
			blogrollMemory = JSON.parse (localStorage.blogrollMemory);
			}
		catch (err) {
			}
		}
	
	const theBlogroll = new blogroll ({
		whereToAppend: $(".divBlogrollContainer"),
		ixcursor: blogrollMemory.ixcursor,
		urlFeedListOpml: appConsts.urlFeedListOpml,
		cursorMovedCallback: function (ixcursor) {
			console.log ("cursorMovedCallback: ixcursor == " + ixcursor);
			blogrollMemory.ixcursor = ixcursor;
			saveBlogrollMemory ();
			}
		});
	
	self.setInterval (everySecond, 1000); 
	}
