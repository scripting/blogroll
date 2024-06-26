#### 6/22/24; 1:01:45 PM by DW

New feedland call that closes the socket. 

This was needed if an app can display more than one blogroll, it has to have a way to release the websocket that was opened by the previous blogroll. 

#### 4/23/24; 1:03:59 PM by DW

if the top of the blogroll container is off-screen it would scroll to make it visible. this is distracting, since the user is focused on the thing they clicked on. 

we now prevent the scrolling with the preventScroll option.

#### 4/21/24; 10:03:26 AM by DW

Release v0.4.6, the first version with quiet mode. 

Test, and immediately start work on 0.4.7, which will have tweaks in the CSS so the blogroll looks good when you install it on a wordpress site via the plugin.

The work is documented <a href="https://github.com/a8cteam51/feedland-blogroll/issues/11">here</a>. 

#### 4/20/24; 11:09:29 AM by DW

Fixed bug in blogroll code, we were making all feedland calls to feedland.social, we weren't correctly passing the param to the feedland function.

Also changed the default for urlFeedlandServer and urlSocketServer to be for feedland.com.

#### 4/16/24; 11:10:34 AM by DW

Let's make it possible for the blogroll to be more quiet. 

big changes that could break apps --

divBlogrollContainer used to say the background-color as white, now we don't do that

#### 4/4/24; 11:31:55 AM by DW

In the demo page we were including smallbootstrap.css, but that's wrong. 

This is one of my pages, and it's not meant to be included by others, that's what the toolkit is for.

#### 4/4/24; 10:24:43 AM by DW

Trying to figure out why clicking the vertical ellipses to open the menu in the blogroll causes the window to scroll. 

* https://chat.openai.com/share/e56378b6-9572-4d8a-98af-6683cfaf6df4

* https://github.com/scripting/feedlandBlogrollToolkit/issues/8#issue-2223925106

#### 4/3/24; 3:56:16 PM by DW

Working on fixing problems in Om's blogroll, due to conflicts with the theme. See the additions near the end of blogroll.css.

Temporarily changed the location we publish this stuff to. /scripting.com/code/testing/blogroll/

#### 4/2/24; 11:16:36 AM by DW

Including the full CSS file for the Bootstrap Toolkit is not okay, as we found out when we tried to deploy it on some sites with complicated styles. 

So I created a file called <a href="http://scripting.com/code/blogroll/smallbootstrap.css">smallbootstrap.css</a>, that contains the minimum set of CSS that blogrolls need from Bootstrap. I determined this by replacing bootstrap.css with an empty file, and looked for things that were wrong and added code from the big CSS file to the small one, and each rule was prefixed with .divBlogrollContainer, so it would only apply to things we added to the page. 

Tooltips were the most difficult, because they insert their objects at the 'body' level, but that was easy to override. 

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

