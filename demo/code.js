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
		title: "Dave's Demo Blogroll",
		flDisplayTitle: true,
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
		includeFeedCallback: function (theFeed) { //3/1/24 by DW
			const when = theFeed.whenUpdated;
			if (!dayGreaterThanOrEqual (when, "2/28/2024")) { //filter out sites with no posts since we launched this site
				if (!stringContains (theFeed.title, "mullenweg")) { //but leave matt in, he has posted, and want to be sure shows
					return (false);
					}
				}
			else {
				if (when === undefined) {
					return (false);
					}
				}
			console.log (theFeed.whenUpdated + ": " + theFeed.title)
			return (true);
			},
		blogrollDisplayedCallback: function () {
			console.log ("blogrollDisplayedCallback");
			$(".divPageBody").css ("display", "block");
			}
		});
	hitCounter ();
	}
