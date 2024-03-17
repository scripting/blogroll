

var theBlogroll;

function saveBlogrollMemory () {
	}

function startBlogroll () {
	theBlogroll = new blogroll ({
		title: "Just A Blogroll",
		urlBlogrollOpml: "https://feedland.social/opml?screenname=davewiner&catname=blogroll",
		urlFeedlandViewBlogroll: "https://feedland.social/?username=davewiner&catname=blogroll", 
		idWhereToAppend: "idBlogrollContainer",
		maxItemsInBlogroll: 40,
		blogrollDisplayedCallback: function () {
			console.log ("blogrollDisplayedCallback");
			$(".divPageBody").css ("display", "block");
			}
		});
	}

function startup () {
	console.log ("startup");
	startBlogroll ();
	hitCounter ();
	}
