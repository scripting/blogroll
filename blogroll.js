function blogroll (userOptions) {
	console.log ("blogroll");
	var options = {
		whereToAppend: $(".divBlogrollContainer"),
		title: "blogroll.social",
		urlSocketServer: "wss://feedland.com:443/_ws/",
		flShowSocketMessages: true,
		flDisplayTitle: false,
		maxTitleLength: 25,
		sortBy: "whenUpdated",
		flReverseSort: false,
		maxCharsItemText: 100,
		maxCharsItemTextTooltip: 1000,
		flEllipsesAfterText: true,
		ixcursor: 0,
		urlFeedListOpml: undefined,
		maxDaysInBlogroll: Infinity,
		flSortLinks: true, //2/19/24 by DW
		flBlogrollUpdates: true,
		cursorMovedCallback: function (ixcursor) {
			},
		sortOptionsChangedCallback: function (sortBy, flReverseSort) {
			},
		blogrollDisplayedCallback: function () {
			}
		};
	function copyUserOptions (userOptions) {
		if (userOptions !== undefined) {
			for (x in userOptions) {
				if (userOptions [x] !== undefined) {
					options [x] = userOptions [x];
					}
				}
			}
		}
	copyUserOptions (userOptions);
	
	var theTable = undefined;
	const whenstart = new Date ();
	
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
				mySocket = new WebSocket (options.urlSocketServer); 
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
								if (options.flShowSocketMessages) {
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
	function getTheFeedList (urlFeedListOpml, callback) {
		const whenstart = new Date ();
		getFeedlistFromOpml (urlFeedListOpml, function (err, theFeedlist, theOutlineHead) {
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
		if (feedNotInDatabase (theFeed)) {
			const message = "Can't expand because feed isn't in the database.";
			callback ({message});
			}
		else {
			getFeedItems (theFeed.feedUrl, maxItems, callback);
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
		
		theTable = $("<table class=\"divBlogroll\"></table>");
		const theTableBody = $("<tbody></tbody>");
		theTable.append (theTableBody);
		
		function appendTitleAboveTable () {
			if (options.flDisplayTitle) {
				const divBlogrollTitle = $("<div class=\"divBlogrollTitle\"></div>");
				
				const spLeftTitleArrow = $("<span class=\"spTitleArrow spTitleArrowLeft\">" + uparrowChar + "</span>");
				const spRightTitleArrow = $("<span class=\"spTitleArrow spTitleArrowRight\">" + uparrowChar + "</span>");
				
				divBlogrollTitle.append (spLeftTitleArrow);
				divBlogrollTitle.append ($("<span class=\"spTitleText\">" + options.title + "</span>"));
				divBlogrollTitle.append (spRightTitleArrow);
				
				options.whereToAppend.append (divBlogrollTitle);
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
				options.whereToAppend.append (divBlogrollSortLinks);
				
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
						if (options.flReverseSort) { //7/11/22 by DW
							let tmp = adate;
							adate = bdate;
							bdate = tmp;
							}
						return (bdate - adate);
					}
				});
			theList.forEach (function (theFeed, ix) {
				if (secondsSince (theFeed.whenUpdated) <= maxsecs) {
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
										
										const itemtext = getItemText (item);
										const spTextPreview = $("<span class=\"spTextPreview\">" + itemtext + "</span>");
										addToolTip (spTextPreview, getFullItemText (), "top");
										feedItem.append (spTextPreview);
										
										const spItemPubdate = $("<span class=\"spItemPubdate\"> </span>"); //by adding a space here, we allow it to wrap before the date --2/16/24 by DW
										const theLink = $("<a href=\"" + item.link + "\" target=\"_blank\" data-pubDate=\"" + item.pubDate + "\">" + getFeedlandTimeString (item.pubDate, false) + "</a>");
										spItemPubdate.append (theLink);
										feedItem.append (spItemPubdate);
										
										addToolTip (spItemPubdate, itemtext, "top");
										
										
										feedItem.click (function (ev) {
											console.log ("feedItem.click");
											console.log (item);
											if (item.link !== undefined) {
												window.open (item.link);
												}
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
						var whenstring = getFeedlandTimeString (new Date (when), false);
						if (endsWith (whenstring, " mins")) { //this gives us back one char in each line, because this is the longest whenstring -- 2/16/24 by DW
							whenstring = stringDelete (whenstring, whenstring.length, 1);
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
		
		appendSortLinksAboveTable (); //2/19/24 by DW
		appendTitleAboveTable (); //2/17/24 by DW
		buildTheTable ();
		options.whereToAppend.append (theTable);
		activateToolTips (); //2/19/24 by DW
		
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
		
		theTable.on ("feedUpdated", function (ev, params) { //2/12/24 by DW
			handleFeedUpdated (params.theFeed);
			});
		theTable.on ("buildBlogroll", function () { //2/19/24 by DW
			buildTheTable ();
			activateToolTips (); 
			});
		
		const socketOptions = {
			urlSocketServer: options.urlSocketServer,
			feedUpdatedCallback: function (theFeed) {
				handleFeedUpdated (theFeed);
				}
			};
		openFeedlandSocket (socketOptions); //2/11/24 by DW
		
		$("body").keydown (function (ev) {
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
			});
		
		runEveryMinute (function () {
			$(".divBlogroll tr").trigger ("dataChanged");
			});
		}
	
	if (options.urlFeedListOpml === undefined) {
		console.log ("Can't display the blogroll because options.urlFeedListOpml was not specified.");
		}
	else {
		getTheFeedList (options.urlFeedListOpml, function (err, theList) {
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
