const appConsts = {
	productnameForDisplay: "blogroll.social",
	
	urlFeedlandServer: "https://feedland.social/",
	
	urlSocketServer: "wss://feedland.social/",
	
	urlBlogrollOpml: "https://feedland.social/opml?screenname=davewiner&catname=blogroll",
	
	urlFeedlandViewBlogroll: "https://feedland.social/?username=davewiner&catname=blogroll", //3/13/24 by DW
	
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

function startBlogroll () {
	theBlogroll = new blogroll ({
		title: "Just A Blogroll",
		urlBlogrollOpml: appConsts.urlBlogrollOpml,
		urlFeedlandViewBlogroll: appConsts.urlFeedlandViewBlogroll, //3/13/24 by DW
		urlSocketServer: appConsts.urlSocketServer,
		whereToAppend: $(".divBlogrollContainer"),
		ixcursor: blogrollMemory.ixcursor,
		sortBy: blogrollMemory.sortBy,
		flReverseSort: blogrollMemory.flReverseSort,
		maxItemsInBlogroll: 40,
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
				return (false);
				}
			else {
				if (when === undefined) {
					return (false);
					}
				}
			return (true);
			},
		blogrollDisplayedCallback: function () {
			console.log ("blogrollDisplayedCallback");
			$(".divPageBody").css ("display", "block");
			}
		});
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
	startBlogroll ();
	hitCounter ();
	}
