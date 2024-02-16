

var globals = {
	theFeedList: undefined
	}


const urlFeedListOpml = "http://scripting.com/publicfolder/feedland/subscriptionLists/wordSocialStarters.opml"; //includes doc, zeldman, manton, me and wp-special-projects -- 2/10/24 by DW


function nowstring () {
	return (new Date ().toLocaleTimeString ());
	}

function openFeedlandSocket (userOptions) { //2/11/24 by DW
	var options = {
		feedUpdatedCallback: function (theFeed) {
			}
		};
	if (userOptions !== undefined) {
		for (var x in userOptions) {
			if (userOptions [x] !== undefined) {
				options [x] = userOptions [x];
				}
			}
		}
	var mySocket = undefined;
	function checkConnection () {
		if (mySocket === undefined) {
			mySocket = new WebSocket (appConsts.urlSocketServer); 
			mySocket.onopen = function (evt) {
				const s = "hello world";
				console.log ("openFeedlandSocket: sending: " + s);
				mySocket.send (s);
				};
			mySocket.onmessage = function (evt) {
				function getPayload (jsontext) {
					var thePayload = undefined;
					try {
						thePayload = JSON.parse (jsontext);
						}
					catch (err) {
						}
					return (thePayload);
					}
				if (evt.data !== undefined) { //no error
					var theCommand = stringNthField (evt.data, "\r", 1);
					var jsontext = stringDelete (evt.data, 1, theCommand.length + 1);
					var thePayload = getPayload (jsontext);
					switch (theCommand) {
						case "updatedFeed":
							if (appConsts.flShowSocketMessages) {
								console.log (nowstring () + ": " + thePayload.title + ", id == " + thePayload.feedUrl);
								}
							options.feedUpdatedCallback (thePayload);
							break;
						}
					}
				};
			mySocket.onclose = function (evt) {
				mySocket = undefined;
				};
			mySocket.onerror = function (evt) {
				};
			}
		}
	self.setInterval (checkConnection, 1000);
	}
function getFeedArray (url, callback) {
	httpRequest (url, undefined, undefined, function (err, opmltext) {
		if (err) {
			callback (err);
			}
		else {
			const theOutline = opml.parse (opmltext), theList = new Array ();
			opml.visitAll (theOutline, function (node) {
				if (node.xmlUrl !== undefined) {
					theList.push (node.xmlUrl);
					}
				return (true); //keep visiting
				});
			callback (undefined, theList);
			}
		});
	}
function getTheFeedList (urlFeedListOpml, callback) {
	getFeedlistFromOpml (urlFeedListOpml, function (err, theFeedlist, theOutlineHead) {
		if (err) {
			callback (err);
			}
		else {
			callback (undefined, theFeedlist);
			}
		});
	}
function getFeedItemsForWedgeExpand (theFeed, maxItems, callback) { 
	if (feedNotInDatabase (theFeed)) {
		const message = "Can't expand because feed isn't in the database.";
		callback ({message});
		}
	else {
		getFeedItems (theFeed.feedUrl, maxItems, callback);
		}
	}

function viewBlogroll (theList, userOptions) {
	
	const cursorClass = "trMyCursor";
	const rightCaret = "<i class=\"fa fa-caret-right darkCaretColor\"></i>";
	const downCaret = "<i class=\"fa fa-caret-down lightCaretColor\"></i>";
	var ixcursor = 0;
	
	var options = {
		whereToAppend: $("body"),
		maxTitleLength: 25,
		sortBy: "whenUpdated",
		flReverseSort: false,
		maxCharsItemText: 200,
		flEllipsesAfterText: false
		}
	for (var x in userOptions) {
		if (userOptions [x] !== undefined) {
			options [x] = userOptions [x];
			}
		}
	
	function getCursorRow () {
		const cursorRow = $("." + cursorClass);
		return (cursorRow);
		}
	function cursorUp () {
		const cursorRow = getCursorRow ();
		const newCursorRow = cursorRow.prev ();
		if ((newCursorRow.length == 0) || (newCursorRow.hasClass ("trHeaderRow"))) { //don't put cursor on column header row
			speakerBeep ();
			return (false); //couldn't move
			}
		else {
			cursorRow.removeClass (cursorClass);
			newCursorRow.addClass (cursorClass);
			return (true);
			}
		}
	function cursorDown () {
		const cursorRow = getCursorRow ();
		const newCursorRow = cursorRow.next ();
		if (newCursorRow.length == 0) {
			speakerBeep ();
			return (false); //couldn't move
			}
		else {
			cursorRow.removeClass (cursorClass);
			newCursorRow.addClass (cursorClass);
			return (true);
			}
		}
	
	const theTable = $("<table class=\"divBlogroll\"></table>");
	const theTableBody = $("<tbody></tbody>");
	theTable.append (theTableBody);
	
	function buildTheTable () {
		const whenstart = new Date ();
		theTableBody.empty ();
		theList.sort (function (a, b) {
			function getDateForSorting (theDate) {
				if (theDate === undefined) {
					return (new Date (0));
					}
				else {
					return (new Date (theDate));
					}
				}
			switch (options.sortBy) {
				case "whenUpdated":
					var adate = getDateForSorting (a.whenUpdated), bdate = getDateForSorting (b.whenUpdated);
					if (options.flReverseSort) { //7/11/22 by DW
						let tmp = adate;
						adate = bdate;
						bdate = tmp;
						}
					return (bdate - adate);
				}
			});
		theList.forEach (function (theFeed, ix) {
			var divNewsPod, tdWedge, spTimeContainer;
			const theClass = (ix == ixcursor) ? " trMyCursor " : "";
			const theRow = $("<tr class=\"trBlogrollFeed" + theClass + "\"></tr>");
			theRow.attr ("data-feedurl", theFeed.feedUrl);
			
			function expandToggle () {
				if (divNewsPod.css ("display") == "none") {
					getFeedItemsForWedgeExpand (theFeed, 5, function (err, theItems) {
						if (err) {
							alertDialog (err.message);
							}
						else {
							const itemList = $("<ul class=\"ulFeedItems\"></ul>");
							theItems.forEach (function (item) {
								function getItemText (item) {
									var itemtext = item.title;
									if (itemtext === undefined) {
										itemtext = maxStringLength (stripMarkup (item.description), options.maxCharsItemText, true, options.flEllipsesAfterText);
										}
									itemtext = trimWhitespace (itemtext);
									
									if (options.flEllipsesAfterText) {
										if (itemtext.length > 0) {
											if (!isPunctuation (itemtext [itemtext.length - 1])) {
												itemtext += ".";
												}
											}
										}
									
									return (itemtext);
									}
								const feedItem = $("<li class=\"liFeedItem\"></li>");
								
								const itemtext = getItemText (item);
								feedItem.append ($("<span>" + itemtext + "</span>"));
								
								const spItemPubdate = $("<span class=\"spItemPubdate\"></span>");
								const theLink = $("<a href=\"" + item.link + "\" target=\"_blank\" data-pubDate=\"" + item.pubDate + "\">" + getFeedlandTimeString (item.pubDate, false) + "</a>");
								spItemPubdate.append (theLink);
								feedItem.append (spItemPubdate);
								
								addToolTip (spItemPubdate, itemtext, "top");
								
								
								feedItem.click (function (ev) {
									console.log (itemtext);
									console.log (jsonStringify (item));
									viewFeedItemInEditor (item, theFeed);
									ev.stopPropagation ();
									});
								itemList.append (feedItem);
								});
							divNewsPod.empty ();
							divNewsPod.append (itemList);
							divNewsPod.css ("visibility", "hidden")
							divNewsPod.css ("display", "block")
							divNewsPod.slideDown (75, undefined, function () {
								tdWedge.html (downCaret);
								divNewsPod.css ("visibility", "visible")
								theFeed.flExpanded = true;
								activateToolTips ();
								});
							}
						});
					}
				else {
					divNewsPod.css ("display", "none")
					tdWedge.html (rightCaret);
					theFeed.flExpanded = false;
					}
				}
			function getTimeString (when) {
				return ("<span class=\"spWhenUpdated\">" + getFeedlandTimeString (new Date (when), false) + "</span>");
				}
			function setDataThatCanChange () { //2/12/24 by DW
				
				
				spTimeContainer.html (getTimeString (theFeed.whenUpdated));
				
				divNewsPod.find ("ul li span.spItemPubdate a").each (function () {
					const pubdateatt = $(this).attr ("data-pubDate");
					const newstring = getFeedlandTimeString (pubdateatt, false);
					$(this).text (newstring);
					});
				
				
				}
			function getWedge () {
				tdWedge = $("<td class=\"tdBlogrollWedge\">" + rightCaret + "</td>");
				tdWedge.click (function (ev) {
					expandToggle ();
					ev.stopPropagation ();
					});
				return (tdWedge);
				}
			function getFeedTitle () {
				const td = $("<td class=\"tdBlogrollFeedTitle\"></td>");
				
				spTimeContainer = $("<span class=\"spTimeContainer\">" + getTimeString (theFeed.whenUpdated) + "</span>");
				td.append (spTimeContainer);
				
				
				
				
				
				var titleString = trimWhitespace (maxStringLength (theFeed.title, options.maxTitleLength, false, true));
				if (titleString.length == 0) {
					titleString = "[empty]";
					}
				
				td.append ($("<span class=\"spTitleString\">" + titleString + "</span>"));
				
				divNewsPod = $("<div class=\"divNewsPod\"></div>");
				td.append (divNewsPod);
				
				return (td);
				}
			function getWhenUpdated () {
				const tdWhenUpdated = $("<td class=\"tdMyFeedWhenUpdated\"></td>");
				tdWhenUpdated.append (getUpdateableTime (theFeed.whenUpdated, "", false));
				return (tdWhenUpdated);
				}
			theRow.append (getWedge ());
			theRow.append (getFeedTitle ());
			theRow.click (function (ev) {
				console.log ("click");
				const flCursorMoves = !theRow.hasClass (cursorClass);
				if (flCursorMoves) {
					$("." + cursorClass).removeClass (cursorClass);
					theRow.addClass (cursorClass);
					}
				else { //second click
					expandToggle ();
					}
				});
			theRow.mousedown (function (ev) {
				ev.preventDefault ();
				});
			theTableBody.append (theRow);
			
			if (getBoolean (theFeed.flExpanded)) { //2/13/24 by DW
				expandToggle ();
				}
			
			theRow.on ("expandToggle", expandToggle);
			theRow.on ("dataChanged", function (ev, theNewFeed) {
				if (theNewFeed !== undefined) {
					theFeed = theNewFeed;
					}
				setDataThatCanChange ();
				});
			});
		console.log ("buildTheTable: " + secondsSince (whenstart) + " secs");
		}
	
	buildTheTable ();
	options.whereToAppend.append (theTable);
	
	function handleFeedUpdated (theFeed) {
		
		
		
		
		
		var flfound = false, ixmatch = undefined, theMatchedFeed = undefined;
		theList.forEach (function (item, ix) {
			if (!flfound) {
				if (item.feedUrl == theFeed.feedUrl) {
					ixmatch = ix;
					theMatchedFeed = item;
					flfound = true;
					}
				}
			});
		if (flfound) { //it's one that we're watching
			if (appConsts.flBlogrollUpdates) {
				console.log (nowstring () + ": " + theFeed.title + ", theFeed.feedUrl == " + theFeed.feedUrl);
				console.log (theFeed);
				}
			theMatchedFeed.whenUpdated = theFeed.whenUpdated;
			
			buildTheTable ();
			
			
			}
		}
	
	theTable.on ("feedUpdated", function (ev, params) { //2/12/24 by DW
		handleFeedUpdated (params.theFeed);
		});
	
	const socketOptions = {
		feedUpdatedCallback: function (theFeed) {
			handleFeedUpdated (theFeed);
			}
		};
	openFeedlandSocket (socketOptions); //2/11/24 by DW
	
	$("body").keydown (function (ev) {
		console.log ("keydown: ev.which == " + ev.which);
		switch (ev.which) {
			case 13: //return
				getCursorRow ().trigger ("expandToggle");
				break;
			case 38: //up arrow
				cursorUp ();
				break;
			case 40: //down arrow
				cursorDown ();
				break;
			}
		ev.preventDefault ();
		});
	
	runEveryMinute (function () {
		$(".divBlogroll tr").trigger ("dataChanged");
		});
	}

function startBlogroll (userOptions) {
	console.log ("startBlogroll");
	
	const whenstart = new Date ();
	
	var options = {
		whereToAppend: $(".divBlogrollContainer")
		};
	if (userOptions !== undefined) {
		for (x in userOptions) {
			if (userOptions [x] !== undefined) {
				options [x] = userOptions [x];
				}
			}
		}
	
	getTheFeedList (urlFeedListOpml, function (err, theList) {
		if (err) {
			console.log ("startBlogroll: err.message == " + err.message);
			}
		else {
			globals.theFeedList = theList;
			
			var feedlandOptions = {
				whereToAppend: options.whereToAppend
				};
			
			const whenstartbuild = new Date ();
			
			viewBlogroll (theList, feedlandOptions);
			
			console.log ("startBlogroll: " + secondsSince (whenstartbuild) + " secs to build the viewer.");
			}
		});
	}

function testFeedUpdated () {
	const now = new Date ();
	const theFeed = {
		"feedUrl": "http://scripting.com/rss.xml",
		"title": "Scripting News",
		"htmlUrl": "http://scripting.com/",
		"description": "It's even worse than it appears..",
		"whenCreated": "2023-07-17T15:51:04.000Z",
		"whenUpdated": now,
		"whoFirstSubscribed": "dave",
		"ctItems": 917,
		"ctSubs": 122,
		"ctSecs": 0.27,
		"ctErrors": 0,
		"ctConsecutiveErrors": 0,
		"errorString": "",
		"whenChecked": "2024-02-12T12:17:19.000Z",
		"ctChecks": 2840,
		"whenLastError": "1970-01-01T00:00:00.000Z",
		"urlCloudServer": "http://rpc.rsscloud.io:5337/pleaseNotify",
		"whenLastCloudRenew": "2024-02-11T15:49:51.000Z",
		"ctCloudRenews": 223,
		"copyright": "&copy; copyright 1994-2023 Dave Winer.",
		"generator": "oldSchool v0.8.8",
		"language": "en-us",
		"twitterAccount": "davewiner",
		"pubDate": "2024-02-12T02:51:25.000Z"
		}
	const params = {
		theFeed
		};
	$(".divBlogroll").trigger ("feedUpdated", [params]);
	}

