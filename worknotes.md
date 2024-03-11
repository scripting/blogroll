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

