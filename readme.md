# blogroll

A browser-based JavaScript toolkit that displays an OPML-based blogroll, with a connection back to FeedLand for realtime features. 

It's designed to be integrated into any website that wants to have a managed blogroll, it can also be included in CMSs and blogging systems. 

Open source license, the goal is to get an installed base of active bloggers to form a network of blogrolls and see where we can go from there.

This page explains how the toolkit works. 

### The demo app

The first place to look is the demo app, which is the code for the <a href="https://blogroll.social/">blogroll.social</a> site. 

The source code is provided in the <a href="https://github.com/scripting/blogroll/tree/master/demo">demo folder</a> here. 

### Creating a blogroll

First thing you need is an OPML subscription list with the feeds of the sites you want to follow.

Create an account in FeedLand if you don't have one and subscribe to the OPML subscription list. Use the Subscribe sub-menu in the main menu. You can load the OPML file over the web or from a local file. 

### Including the blogroll code

In the <head> section of your HMTL page, include the following files. 

```javascript<link href="https://code.scripting.com/blogroll/blogroll.css" rel="stylesheet"><script src="https://code.scripting.com/blogroll/blogroll.js"></script>```

### Add the blogroll to your HTML

In the <body> section of your HTML page, add a div with class `divBlogrollContainer`.

```javascript<div class="divBlogrollContainer"></div>```

### In your JavaScript code

Add a global called appConsts, that has the following values in it. 

```javascriptconst appConsts = {	urlFeedlandServer: "https://feedland.social/",	urlSocketServer: "wss://feedland.social/",	};```

Where your startup code runs, create your blogroll. 

```javascriptconst theBlogroll = new blogroll ({urlFeedListOpml: "http://myblog.org/blogroll.opml"});```

You don't have to save a pointer to the object <i>blogroll</i> returns, you only need it if you plan to call into the blogroll, to change something or get data out of it. 

### Options

Here's a list of the options you can add to the object you pass into the blogroll routine.

* urlFeedListOpml: a string, the URL of the blogroll OPML file,

* whereToAppend: a jQuery object, the DOM object we'll append the blogroll to

* flDisplayTitle: boolean, if true we display a title at the top of the blogroll,

* title: a string, containing the title we'll display,

* maxTitleLength: a number, the maximum number of characters in a title,

* flEllipsesAfterText: a boolean, not used, instead we use CSS to add elipses for titles that have been shortened,

* maxCharsItemText: a number, when the user expands a blogroll entry, it reveals the most recent posts, this is the maximum number of characters displayed for one of these items,

* sortBy: a string, indicates whether we sort by date or title. two values are "whenUpdated" and "title".

* flReverseSort: a boolean, if true we sort in reverse, which is the usual thing when viewing by date,

* ixcursor: a number, says where the bar cursor should appear when the blogroll is initialized,

* maxDaysInBlogroll: a number, any item that hasn't been updated in this number of days is left out of the display.

* flSortLinks: a boolean, if true we include links above the blogroll that allow the user to switch between sorting by title and date, and by reverse and not reverse order.

* cursorMovedCallback, a function, called when the cursor moves, takes one param, the cursor index, a number. Provide this if you want to remember the cursor position for the user.

* sortOptionsChangedCallback: a function, called when the user changes one of the sort options. two params, a sortBy value and a boolean for flReverseSort.

* blogrollDisplayedCallback: a function, called after the blogroll has finished initializing, useful if you have code you want to run at that time.

Most of these options are used in the <a href="https://github.com/scripting/blogroll/tree/master/demo">demo app</a>. 

### Notes

Copy whatever styles you need in your application from the demo app's styles.css file.

