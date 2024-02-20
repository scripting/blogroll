const appConsts = {
	productnameForDisplay: "blogroll.social",
	
	urlFeedlandServer: "https://feedland.com/",
	
	urlSocketServer: "wss://feedland.com:443/_ws/",
	
	urlFeedListOpml: "http://scripting.com/publicfolder/feedland/subscriptionLists/wordSocialStarters.opml", //includes doc, zeldman, manton, me and wp-special-projects -- 2/10/24 by DW
	
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
		whereToAppend: $(".divBlogrollContainer"),
		ixcursor: blogrollMemory.ixcursor,
		sortBy: blogrollMemory.sortBy,
		flReverseSort: blogrollMemory.flReverseSort,
		urlFeedListOpml: appConsts.urlFeedListOpml,
		maxDaysInBlogroll: 60,
		cursorMovedCallback: function (ixcursor) {
			console.log ("cursorMovedCallback: ixcursor == " + ixcursor);
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
