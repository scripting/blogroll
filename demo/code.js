const appConsts = {
	productnameForDisplay: "blogroll.social",
	
	urlFeedlandServer: "https://feedland.social/",
	
	urlSocketServer: "wss://feedland.social/",
	
	urlFeedListOpml: "http://scripting.com/code/blogroll/starterfeeds.opml", 
	
	flShowSocketMessages: true,
	flBlogrollUpdates: true,
	};

var blogrollMemory = {
	ixcursor: 0,
	sortBy: "whenUpdated",
	flReverseSort: true
	}

var theBlogroll;

function saveBlogrollMemory () {
	localStorage.blogrollMemory = jsonStringify (blogrollMemory);
	}

function everySecond () {
	}
function startup () {
	console.log ("startup");
	
	
	
	if (localStorage.blogrollMemory !== undefined) {
		try {
			var jstruct = JSON.parse (localStorage.blogrollMemory);
			for (var x in jstruct) {
				if (jstruct [x] !== undefined) {
					blogrollMemory [x] = jstruct [x];
					}
				}
			}
		catch (err) {
			}
		}
	
	theBlogroll = new blogroll ({
		urlSocketServer: appConsts.urlSocketServer,
		whereToAppend: $(".divBlogrollContainer"),
		ixcursor: blogrollMemory.ixcursor,
		sortBy: blogrollMemory.sortBy,
		flReverseSort: blogrollMemory.flReverseSort,
		urlFeedListOpml: appConsts.urlFeedListOpml,
		maxDaysInBlogroll: 60,
		cursorMovedCallback: function (ixcursor) {
			blogrollMemory.ixcursor = ixcursor;
			saveBlogrollMemory ();
			},
		sortOptionsChangedCallback: function (sortBy, flReverseSort) {
			console.log ("sortOptionsChangedCallback: sortBy == " + sortBy + ", flReverseSort == " + flReverseSort);
			blogrollMemory.sortBy = sortBy;
			blogrollMemory.flReverseSort = flReverseSort;
			saveBlogrollMemory ();
			},
		blogrollDisplayedCallback: function () {
			console.log ("blogrollDisplayedCallback");
			}
		});
	
	
	
	
	self.setInterval (everySecond, 1000); 
	}
