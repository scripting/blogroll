function feedland (userOptions) { //3/16/24 by DW
	var options = {
		urlFeedlandServer: "https://feedland.social/",
		urlSocketServer: "wss://feedland.social/",
		flShowSocketMessages: true
		}
	if (userOptions !== undefined) { //allow caller to override defaults
		for (x in userOptions) {
			if (userOptions [x] !== undefined) {
				options [x] = userOptions [x];
				}
			}
		}
	
	function feedNotInDatabase (theFeed) { //6/3/23 by DW
		const flFeedInDatabase = theFeed.whenCreated !== undefined;
		return (!flFeedInDatabase);
		}
	function getFeedlistFromOpml (url, callback) {//6/2/23 by DW
		console.log ("feedland.getFeedlistFromOpml: url == " + url);
		servercall ("getfeedlistfromopml", {url}, false, function (err, thePackage) {
			if (err) {
				callback (err);
				}
			else {
				callback (undefined, thePackage.feedlist, thePackage.head);
				}
			}, options.urlFeedlandServer);
		}
	function getFeedItems (feedUrl, maxItems=5, callback) { //8/31/22 by DW
		console.log ("feedland.getFeedlistFromOpml: feedUrl == " + feedUrl);
		const params = {
			url: feedUrl, 
			maxItems
			};
		servercall ("getfeeditems", params, false, callback, options.urlFeedlandServer);
		}
	function openSocket (handleUpdateCallback) { 
		var mySocket = undefined;
		function checkConnection () {
			if (mySocket === undefined) {
				mySocket = new WebSocket (options.urlSocketServer); 
				mySocket.onopen = function (evt) {
					const s = "hello world";
					console.log ("feedland.openSocket: sending: " + s);
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
								if (options.flShowSocketMessages) {
									console.log (nowstring () + ": " + thePayload.title + ", id == " + thePayload.feedUrl);
									}
								if (handleUpdateCallback !== undefined) { //3/16/24 by DW
									handleUpdateCallback (thePayload);
									}
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
	
	this.getFeedItems = getFeedItems;
	this.getFeedlistFromOpml = getFeedlistFromOpml;
	this.openSocket = openSocket;
	this.feedNotInDatabase = feedNotInDatabase;
	this.openSocket = openSocket;
	}
function blogroll (userOptions) {
	const version = "0.4.4";
	console.log ("blogroll v" + version);
	
	var blogrollMemory = { //3/15/24 by DW
		ixcursor: 0,
		sortBy: "whenUpdated",
		flReverseSort: true
		}
	function saveBlogrollMemory () { //3/15/24 by DW
		localStorage.blogrollMemory = jsonStringify (blogrollMemory);
		}
	if (localStorage.blogrollMemory !== undefined) { //3/15/24 by DW
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
	
	var options = {
		urlBlogrollOpml: undefined,
		urlFeedlandViewBlogroll: undefined, //3/13/24 by DW
		idWhereToAppend: "idBlogrollContainer",
		title: "blogroll.social",
		flDisplayTitle: true, 
		urlSocketServer: "wss://feedland.social/",
		flShowSocketMessages: true,
		maxTitleLength: 25,
		ixcursor: blogrollMemory.ixcursor,
		sortBy: blogrollMemory.sortBy,
		flReverseSort: blogrollMemory.flReverseSort,
		maxCharsItemText: 100,
		maxCharsItemTextTooltip: 1000,
		flEllipsesAfterText: true,
		maxDaysInBlogroll: Infinity,
		maxItemsInBlogroll: Infinity, //3/3/24 by DW
		flSortLinks: true, //2/19/24 by DW
		flBlogrollUpdates: true,
		whenCutoffDate: undefined, //2/29/24 by DW
		flUseBlogrollMemory: true, //3/15/24 by DW
		cursorMovedCallback: function (ixcursor) {
			if (options.flUseBlogrollMemory) {
				blogrollMemory.ixcursor = ixcursor;
				saveBlogrollMemory ();
				}
			},
		sortOptionsChangedCallback: function (sortBy, flReverseSort) {
			if (options.flUseBlogrollMemory) {
				blogrollMemory.sortBy = sortBy;
				blogrollMemory.flReverseSort = flReverseSort;
				saveBlogrollMemory ();
				}
			},
		includeFeedCallback: function (theFeed) { //3/1/24 by DW
			return (true);
			},
		blogrollDisplayedCallback: function () {
			}
		};
	function copyUserOptions (userOptions) {
		if (userOptions !== undefined) {
			if (userOptions.urlFeedListOpml !== undefined) { //3/12/24 by DW
				userOptions.urlBlogrollOpml = userOptions.urlFeedListOpml;
				delete userOptions.urlFeedListOpml;
				}
			for (x in userOptions) {
				if (userOptions [x] !== undefined) {
					options [x] = userOptions [x];
					}
				}
			}
		}
	copyUserOptions (userOptions);
	
	console.log ("options == " + jsonStringify (options));
	
	var divBlogroll = undefined;
	var theTable = undefined;
	const whenstart = new Date ();
	
	const myFeedland = new feedland (options); //3/16/24 by DW
	
	function encode (s) { //8/11/21 by DW
		s = encodeXml (s);
		s = replaceAll (s, "'", "&" + "quot;"); //10/15/21 by DW
		return (s);
		}
	function getTheFeedList (urlBlogrollOpml, callback) {
		const whenstart = new Date ();
		myFeedland.getFeedlistFromOpml (urlBlogrollOpml, function (err, theFeedlist, theOutlineHead) {
			if (err) {
				callback (err);
				}
			else {
				console.log ("getTheFeedList: " + secondsSince (whenstart) + " secs.");
				callback (undefined, theFeedlist);
				}
			});
		}
	function getFeedItemsForWedgeExpand (theFeed, maxItems, callback) { 
		if (myFeedland.feedNotInDatabase (theFeed)) {
			const message = "Can't expand because feed isn't in the database.";
			callback ({message});
			}
		else {
			myFeedland.getFeedItems (theFeed.feedUrl, maxItems, callback);
			}
		}
	function viewListInFeedland () { //3/13/24 by DW
		console.log ("viewListInFeedland");
		if (options.urlFeedlandViewBlogroll === undefined) {
			alertDialog ("Can't view the blogroll in FeedLand, because the URL hasn't been specified in the software.");
			}
		else {
			window.open (options.urlFeedlandViewBlogroll);
			}
		}
	function viewBlogroll (theList) {
		
		const cursorClass = "trBlogrollCursor";
		const rightCaret = "<i class=\"fa fa-caret-right darkCaretColor\"></i>";
		const downCaret = "<i class=\"fa fa-caret-down lightCaretColor\"></i>";
		const uparrowChar = "<i class=\"fa fa-arrow-up\"></i>";
		const downarrowChar = "<i class=\"fa fa-arrow-down\"></i>";
		
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
				options.cursorMovedCallback (newCursorRow.index ());
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
				options.cursorMovedCallback (newCursorRow.index ());
				return (true);
				}
			}
		function moveCursorToRow (theRow) { //2/16/24 by DW
			$("." + cursorClass).removeClass (cursorClass);
			theRow.addClass (cursorClass);
			options.cursorMovedCallback (theRow.index ());
			}
		
		theTable = $("<table class=\"divBlogrollTable\"></table>");
		const theTableBody = $("<tbody></tbody>");
		theTable.append (theTableBody);
		
		function getBlogrollMenu () { //3/11/24 by DW
			
			
			
			const divBlogrollMenu = $("<div class=\"dropdown divBlogrollMenu\"></div>");
			const aMenuLink = $("<a class=\"dropdown-toggle\" href=\"#\" role=\"button\" id=\"dropdownMenuLink\" data-toggle=\"dropdown\" aria-expanded=\"false\"><i class=\"fas fa-ellipsis-v\"></i></a>");
			const ulMenu = $("<ul class=\"dropdown-menu\" aria-labelledby=\"dropdownMenuLink\"></ul>");
			
			divBlogrollMenu.append (aMenuLink);
			divBlogrollMenu.append (ulMenu);
			
			function addDividerToMenu () {
				ulMenu.append ($("<li class=\"divider\"></li>"));
				}
			function addMenuItem (linetext, callback) {
				const menuItem = $("<li><a class=\"dropdown-item\" href=\"#\">" + linetext + "</a></li>");
				ulMenu.append (menuItem);
				menuItem.click (function () {
					console.log ("click " + linetext);
					if (callback !== undefined) {
						callback ();
						}
					});
				}
			
			addMenuItem ("Blogroll home..", function () {
				window.open ("https://blogroll.social/");
				});
			addMenuItem ("How to use..", function () {
				window.open ("https://blogroll.social/howto.opml");
				});
			addDividerToMenu ();
			addMenuItem ("View this list in OPML..", function () {
				window.open (options.urlBlogrollOpml);
				});
			addMenuItem ("View list in FeedLand...", function () {
				viewListInFeedland ();
				});
			addDividerToMenu ();
			addMenuItem ("Developer info..", function () {
				window.open ("https://opml.org/blogroll.opml");
				});
			
			return (divBlogrollMenu);
			}
		
		function appendTitleAboveTable () {
			if (options.flDisplayTitle) {
				const divBlogrollTitle = $("<div class=\"divBlogrollTitle\"></div>");
				divBlogrollTitle.append ($("<div class=\"divTitleText\">" + options.title + "</div>"));
				divBlogroll.append (divBlogrollTitle);
				}
			}
		function appendSortLinksAboveTable () { //2/19/24 by DW
			if (options.flSortLinks) {
				const divBlogrollSortLinks = $("<div class=\"divBlogrollSortLinks\"></div>");
				const spTitleLink = $("<span class=\"spTitleLink\">Title</span>");
				const spWhenLink = $("<span class=\"spWhenLink\">When</span>");
				divBlogrollSortLinks.append (spTitleLink);
				divBlogrollSortLinks.append (spWhenLink);
				setSelectedLink ();
				divBlogroll.append (divBlogrollSortLinks);
				
				function setSelectedLink () {
					if (options.sortBy == "title") {
						spTitleLink.addClass ("selected");
						spWhenLink.removeClass ("selected");
						}
					else {
						spWhenLink.addClass ("selected");
						spTitleLink.removeClass ("selected");
						}
					}
				function handleClick (sortByValue) {
					if (options.sortBy == sortByValue) {
						options.flReverseSort = !options.flReverseSort;
						}
					else {
						options.sortBy = sortByValue;
						options.flReverseSort = false;
						}
					setSelectedLink ();
					buildTheTable ();
					options.sortOptionsChangedCallback (options.sortBy, options.flReverseSort);
					}
				
				spTitleLink.click (function () {
					handleClick ("title");
					});
				spWhenLink.click (function () {
					handleClick ("whenUpdated");
					});
				}
			}
		function buildTheTable () {
			const whenstart = new Date ();
			const maxsecs = options.maxDaysInBlogroll * 60 * 60 * 24;
			var ctitems = 0;
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
					case "title":
						var alower = trimWhitespace (a.title.toLowerCase ()), val; //9/30/23 by DW
						var blower = trimWhitespace (b.title.toLowerCase ());
						if (options.flReverseSort) { //7/11/22 by DW
							let tmp = alower;
							alower = blower;
							blower = tmp;
							}
						if (alower.length == 0) {
							return (1);
							}
						if (blower.length == 0) {
							return (-1);
							}
						if (alower == blower) {
							val = 0;
							}
						else {
							if (blower > alower) {
								val = -1;
								}
							else {
								val = 1;
								}
							}
						return (val);
					case "whenUpdated":
						var adate = getDateForSorting (a.whenUpdated), bdate = getDateForSorting (b.whenUpdated);
						if (!options.flReverseSort) { //7/11/22 by DW & 3/10/24 by DW
							let tmp = adate;
							adate = bdate;
							bdate = tmp;
							}
						return (bdate - adate);
					}
				});
			theList.forEach (function (theFeed, ix) {
				function includeThisFeed () {
					var flInclude = true;
					if (ctitems++ > options.maxItemsInBlogroll) {
						flInclude = false;
						}
					else {
						if (!options.includeFeedCallback (theFeed)) { //3/1/24 by DW
							flInclude = false;
							}
						else {
							if (theFeed.whenUpdated === undefined) {
								flInclude = false;
								}
							else {
								if (options.whenCutoffDate !== undefined) {
									if (dayGreaterThanOrEqual (options.whenCutoffDate, theFeed.whenUpdated)) {
										flInclude = false;
										}
									}
								if (secondsSince (theFeed.whenUpdated) > maxsecs) {
									flInclude = false;
									}
								}
							}
						}
					return (flInclude);
					}
				if (includeThisFeed ()) { 
					var divNewsPod, tdWedge, spTimeContainer;
					const theClass = (ix == options.ixcursor) ? " trBlogrollCursor " : "";
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
										function hidePopover (thePopover) {
											$(thePopover).data ("content", "");
											$(thePopover).popover ("hide");
											}
										function getFullItemText () { //2/26/24 by DW
											var fullItemText = item.title;
											if (fullItemText === undefined) {
												fullItemText = maxStringLength (stripMarkup (item.description), options.maxCharsItemTextTooltip, true, options.flEllipsesAfterText);
												}
											fullItemText = trimWhitespace (itemtext);
											
											if (options.flEllipsesAfterText) {
												if (fullItemText.length > 0) {
													if (!isPunctuation (fullItemText [fullItemText.length - 1])) {
														fullItemText += ".";
														}
													}
												}
											
											return (fullItemText);
											}
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
										
										const spTextPreview = $("<span class=\"spTextPreview\">" + getItemText (item) + "</span>");
										feedItem.append (spTextPreview);
										
										const spItemPubdate = $("<span class=\"spItemPubdate\"> </span>"); //by adding a space here, we allow it to wrap before the date --2/16/24 by DW
										const theLink = $("<a href=\"" + item.link + "\" target=\"_blank\" data-pubDate=\"" + item.pubDate + "\">" + getFeedlandTimeString (item.pubDate, false) + "</a>");
										spItemPubdate.append (theLink);
										feedItem.append (spItemPubdate);
										
										const placeToPopOver = spItemPubdate;
										
										placeToPopOver.mouseenter (function (ev) {
											if (item.description !== undefined) {
												placeToPopOver.data ("toggle", "popover");
												placeToPopOver.data ("placement", "right");
												placeToPopOver.data ("html", "true");
												placeToPopOver.data ("content", maxStringLength (item.description, 500, true, true));
												placeToPopOver.popover ("show");
												}
											});
										placeToPopOver.mouseleave (function (ev) {
											hidePopover (placeToPopOver);
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
						var whenstring = getFeedlandTimeString (new Date (when), false);
						if (endsWith (whenstring, " mins")) { //this gives us back one char in each line, because this is the longest whenstring -- 2/16/24 by DW
							whenstring = stringDelete (whenstring, whenstring.length, 1);
							}
						if (whenstring.length == 0) {
							console.log (theFeed);
							}
						return ("<span class=\"spWhenUpdated\">" + whenstring + "</span>");
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
							moveCursorToRow (theRow); //2/16/24 by DW
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
						
						const spTitleString = $("<span class=\"spTitleString\">" + titleString + "</span>");
						td.append (spTitleString);
						addToolTip (spTitleString, theFeed.description);
						
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
						const flCursorMoves = !theRow.hasClass (cursorClass);
						if (flCursorMoves) {
							moveCursorToRow (theRow);
							console.log (theFeed);
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
					}
				});
			}
		function whereToAppend () { //3/15/24 by DW
			if (options.whereToAppend !== undefined) {
				return (options.whereToAppend);
				}
			else {
				return ($("#" + options.idWhereToAppend));
				}
			}
		function isBlogrollFocus () { //3/17/24 by DW
			const where = whereToAppend ();
			const fl = where.is (":focus");
			return (fl);
			}
		function makeSureBlogrollDisplayed () { //2/29/24 by DW
			const where = whereToAppend ();
			if (where.css ("display") != "block") {
				where.css ("display", "block");
				}
			}
		function getFooter () {
			const theFooter = $("<div class=\"divBlogrollFooter\"></div>");
			theFooter.html ("<a href=\"https://blogroll.social/\" target=\"_blank\">Powered by FeedLand.</a>");
			return (theFooter);
			}
		
		const where = whereToAppend (); //3/15/24 by DW
		where.append (getBlogrollMenu ());
		
		where.click (function () { //3/17/24 by DW -- didn't get this working
			$(this).focus ();
			if (where.is (":focus")) {
				console.log ("focus");
				}
			});
		
		divBlogroll = $("<div class=\"divBlogroll\"></div>");
		where.append (divBlogroll);
		
		appendTitleAboveTable (); //2/17/24 by DW
		appendSortLinksAboveTable (); //2/19/24 by DW
		buildTheTable ();
		divBlogroll.append (theTable);
		
		divBlogroll.append (getFooter ()); //3/15/24 by DW
		
		activateToolTips (); //2/19/24 by DW
		
		makeSureBlogrollDisplayed (); //2/29/24 by DW
		
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
				if (options.flBlogrollUpdates) {
					console.log (nowstring () + ": " + theFeed.title + ", theFeed.feedUrl == " + theFeed.feedUrl);
					theMatchedFeed.whenUpdated = theFeed.whenUpdated;
					
					buildTheTable ();
					activateToolTips (); //2/19/24 by DW
					
					}
				}
			}
		
		myFeedland.openSocket (handleFeedUpdated);
		
		theTable.on ("feedUpdated", function (ev, params) { //2/12/24 by DW
			handleFeedUpdated (params.theFeed);
			});
		theTable.on ("buildBlogroll", function () { //2/19/24 by DW
			buildTheTable ();
			activateToolTips (); 
			});
		
		$("body").keydown (function (ev) {
			if (isBlogrollFocus ()) { //3/17/24 by DW
				var flconsumed = false;
				switch (ev.which) {
					case 13: //return
						getCursorRow ().trigger ("expandToggle");
						flconsumed = true;
						break;
					case 38: //up arrow
						cursorUp ();
						flconsumed = true;
						break;
					case 40: //down arrow
						cursorDown ();
						flconsumed = true;
						break;
					}
				if (flconsumed) {
					ev.preventDefault ();
					}
				}
			});
		
		runEveryMinute (function () {
			$(".divBlogroll tr").trigger ("dataChanged");
			});
		}
	
	if (options.urlBlogrollOpml === undefined) {
		console.log ("Can't display the blogroll because options.urlBlogrollOpml was not specified.");
		}
	else {
		getTheFeedList (options.urlBlogrollOpml, function (err, theList) {
			if (err) {
				console.log ("startBlogroll: err.message == " + err.message);
				}
			else {
				const whenstartbuild = new Date ();
				viewBlogroll (theList);
				console.log ("blogroll: " + secondsSince (whenstartbuild) + " secs to build the viewer.");
				options.blogrollDisplayedCallback ();
				}
			});
		}
	
	this.buildBlogroll = function (userOptions) {
		console.log ("buildBlogroll: userOptions == " + jsonStringify (userOptions));
		copyUserOptions (userOptions);
		theTable.trigger ("buildBlogroll");
		};
	}
