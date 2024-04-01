#### 4/1/24; 10:26:21 AM by DW

options.flBlogrollUpdates should have just controlled the console.log message, not whether the update was processed. once fixed, the realtime updates started again.  

#### 3/21/24; 8:33:21 AM by DW

Changed default value for flBlogrollUpdates to false and left flShowSocketMessages as true. We were getting two messages for many feed updates. One from the websocket code, the other when it's inserted into the blogroll. I went with the websockets code because we can see what things were added to the blogroll. I'd also like to see which feeds have updated, even ones that are not part of the blogroll. 

#### 3/18/24; 10:38:08 AM by DW

User can now set focus, per this <a href="http://scripting.com/2024/03/18.html#a143125">description</a> on my blog.

One change in your code, divBlogrollContainer has to have a tabindex attribute with a value of "0".

#### 3/16/24; 5:03:00 PM by DW

Factored feedland-specific code from blogroll and put it into a routine called feedland.

All calls to feedland will go through this function. 

Very neat, easy to see where the boundary is. 

Use the API routines, don't go behind the API, and we'll endeavor not to break you. 

Still early days here...

#### 3/16/24; 4:28:33 PM by DW

It's possible a feed might appear twice in a blogroll, because it might be in two reading lists you subscribed to, for example.

Not sure how I'm going to deal with this. 

#### 3/15/24; 10:49:15 AM by DW

Sucked the blogrollMemory feature from the demo app into the package. No reason every app should have to recreate this. 

If you want to turn it off, pass flUseBlogrollMemory == false in your options object. 

#### 3/13/24; 11:09:14 AM by DW

Finished the menu for now, and chose Cinzel font for the title part of the blogroll. 

#### 3/12/24; 2:14:05 PM by DW

Change the name of options.urlFeedListOpml to options.urlBlogrollOpml.

but we still accept urlFeedListOpml to ease transition

We need a default for options.urlBlogrollOpml.

#### 3/11/24; 10:27:10 AM by DW

Doing some work off on the site, we now have to worry about deployed code.

To release the new version, drop the /testing from the path above.

#### 3/10/24; 4:06:42 PM by DW

We got flReverseSort backwards in its implementation. 

If it's true, then we show the feeds in reverse chronologic order. 

#### 2/29/24; 11:38:55 AM by DW

New option -- options.whenCutoffDate, if defined, we won't include feeds that haven't updated since that date.

#### 2/14/24; 10:55:21 AM by DW

Pulled out of a larger project, realized this should be a feature that should be included in lots of projects.

#### 2/13/24; 10:50:25 AM by DW

#### Big question, when moving an item to the top of the list, should we do the restructuring with jQuery or rebuild the list.

restructuring with jQuery is appealing, but I learned that when you do this you can lose the event handlers attached to the node you're moving

since we use event handlers a lot, this means a lot of extra complexity to get all that working, much quicker to just rebuild

but, the problem with that is how do you remember the state of the node you're moving, whether it's expanded or collapsed, for now, but likely to be other things in the future.

i'm going to go the rebuilding note, but i wanted to leave this here because i keep going back and forth on it, and expect to keep doing so.

#### And then I changed my mind again! There's so much stuff that needs to be recalculated, better to just redraw the whole thing

i got around saving expansion state in local storage by adding a value to the feed record we have for each feed we're viewing. 

it's kind of a hack, but it worked the first time. i don't like saving stuff in localstorage anyway, we need identity for that

if this thing becomes a serious project, we'll add identity.

