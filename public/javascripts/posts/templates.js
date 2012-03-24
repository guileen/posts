jade.templates['posts/entry-tpl.jade'] = function(locals){ var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var __jade = [{ lineno: 1, filename: "posts/entry-tpl.jade" }];
try {
var buf = [];
with (locals || {}) {
var interp;
__jade.unshift({ lineno: 1, filename: __jade[0].filename });
__jade.unshift({ lineno: 1, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="row entry"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 3, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="avatar-info"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 4, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="avatar"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 6, filename: __jade[0].filename });
buf.push('<!-- 1. TODO (personalize) diamond avatar border, HD, big size avatar upload-->');
__jade.shift();
__jade.unshift({ lineno: 7, filename: __jade[0].filename });
buf.push('<!-- Take a video of how we create diamond image, gathering pictures, hand drawing, pick out best one, make digital version, take avatar photo, apply border, final effect-->');
__jade.shift();
__jade.unshift({ lineno: 8, filename: __jade[0].filename });
buf.push('<!-- 2. auto switch border service if there already many border design, to help those border collector-->');
__jade.shift();
__jade.unshift({ lineno: 9, filename: __jade[0].filename });
buf.push('<!-- 3. mouse hover, name card (only VIP), more personalize information, background style and so on.-->');
__jade.shift();
__jade.unshift({ lineno: 10, filename: __jade[0].filename });
buf.push('<!-- VIP will get be promote for a while, to make him think it works-->');
__jade.shift();
__jade.unshift({ lineno: 11, filename: __jade[0].filename });
buf.push('<!-- topic border, topic chain style, topic controls icons-->');
__jade.shift();
__jade.unshift({ lineno: 12, filename: __jade[0].filename });
buf.push('<!-- NOTE effect must note bother other users, don\'t be very noise-->');
__jade.shift();
__jade.unshift({ lineno: 13, filename: __jade[0].filename });
buf.push('<!-- promote is another standalone service.-->');
__jade.shift();
__jade.unshift({ lineno: 13, filename: __jade[0].filename });
buf.push('<a');
buf.push(attrs({ 'href':("#"), 'title':(user.title || user.fullname), "class": ('tipsy') + ' ' + ('avatar') }));
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 15, filename: __jade[0].filename });
buf.push('<img');
buf.push(attrs({ 'src':(avatar(user, 64) || favicon(post.link)) }));
buf.push('/>');
__jade.shift();
__jade.shift();
buf.push('</a>');
__jade.shift();
__jade.unshift({ lineno: 16, filename: __jade[0].filename });
buf.push('<!-- show this on hover, click to pop menu-->');
__jade.shift();
__jade.unshift({ lineno: 16, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="user_info"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.unshift({ lineno: 27, filename: __jade[0].filename });
buf.push('<!-- the popup menu');
__jade.unshift({ lineno: 19, filename: __jade[0].filename });
__jade.unshift({ lineno: 19, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="user-menu"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 20, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="clearfix"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 21, filename: __jade[0].filename });
buf.push('<a>5123');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</a>');
__jade.shift();
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.unshift({ lineno: 22, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="clearfix"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 23, filename: __jade[0].filename });
buf.push('<a');
buf.push(' href="#"')
buf.push('>Chat');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</a>');
__jade.shift();
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.unshift({ lineno: 24, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="clearfix"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 25, filename: __jade[0].filename });
buf.push('<a');
buf.push(' href="#"')
buf.push('>Unfollow');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</a>');
__jade.shift();
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.shift();
buf.push('-->');
__jade.shift();
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.unshift({ lineno: 27, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="post"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 29, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="post-controls right"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 31, filename: __jade[0].filename });
buf.push('<!-- scores-->');
__jade.shift();
__jade.unshift({ lineno: 32, filename: __jade[0].filename });
buf.push('<!-- show-comment       1-->');
__jade.shift();
__jade.unshift({ lineno: 33, filename: __jade[0].filename });
buf.push('<!-- add comment        2-->');
__jade.shift();
__jade.unshift({ lineno: 34, filename: __jade[0].filename });
buf.push('<!-- bookmark(favorit)  3-->');
__jade.shift();
__jade.unshift({ lineno: 35, filename: __jade[0].filename });
buf.push('<!-- reblog             4  need comment-->');
__jade.shift();
__jade.unshift({ lineno: 36, filename: __jade[0].filename });
buf.push('<!-- junk              -5-->');
__jade.shift();
__jade.unshift({ lineno: 37, filename: __jade[0].filename });
buf.push('<!-- searching keywords also effect to user taste-->');
__jade.shift();
__jade.unshift({ lineno: 37, filename: __jade[0].filename });
var span = (post.link);
__jade.shift();
__jade.unshift({ lineno: 38, filename: __jade[0].filename });
if ((user._id == post.authorId /*|| isModerator(user)*/))
{
__jade.unshift({ lineno: 39, filename: __jade[0].filename });
__jade.unshift({ lineno: 39, filename: __jade[0].filename });
buf.push('<a');
buf.push(attrs({ 'href':("#/post/" + ( post._id ) + "/modify"), 'title':("Modify"), "class": ('modify-post') + ' ' + ('icon') + ' ' + ('pen') + ' ' + ('clickable') + ' ' + ('tipsy') }));
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</a>');
__jade.shift();
__jade.unshift({ lineno: 40, filename: __jade[0].filename });
buf.push('<span');
buf.push(attrs({ 'title':("Remove"), 'id':("rm-" + ( post._id ) + ""), "class": ('icon') + ' ' + ('trash') + ' ' + ('clickable') + ' ' + ('tipsy') }));
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</span>');
__jade.shift();
__jade.shift();
}
__jade.shift();
__jade.unshift({ lineno: 43, filename: __jade[0].filename });
buf.push('<!-- shared use .share.done-->');
__jade.shift();
__jade.unshift({ lineno: 44, filename: __jade[0].filename });
buf.push('<!-- a.icon.share.clickable.tipsy(class = false && \'done\', href=\'/share/#{entry._id}\', title="Share to SNS", rel="modal:open")-->');
__jade.shift();
__jade.unshift({ lineno: 46, filename: __jade[0].filename });
buf.push('<!-- copy link for share-->');
__jade.shift();
__jade.unshift({ lineno: 47, filename: __jade[0].filename });
buf.push('<!-- span.icon.link.clickable.tipsy(class = false && \'fill\', title="Link")-->');
__jade.shift();
__jade.unshift({ lineno: 49, filename: __jade[0].filename });
buf.push('<!-- TODO read later-->');
__jade.shift();
__jade.unshift({ lineno: 50, filename: __jade[0].filename });
buf.push('<!-- span.icon.clock.clickable.tipsy(title="Read later")-->');
__jade.shift();
__jade.unshift({ lineno: 52, filename: __jade[0].filename });
buf.push('<!-- like has no effect, user wont click it-->');
__jade.shift();
__jade.unshift({ lineno: 53, filename: __jade[0].filename });
buf.push('<!-- use bookmark, favorit-->');
__jade.shift();
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.unshift({ lineno: 55, filename: __jade[0].filename });
buf.push('<!-- TODO use redis interset(user:id:friends, post:id:sharer)-->');
__jade.shift();
__jade.unshift({ lineno: 56, filename: __jade[0].filename });
buf.push('<!-- if entry.friendsSharedThis-->');
__jade.shift();
__jade.unshift({ lineno: 56, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="friends-info"')
buf.push('>xxx, xxx, xxx shared this post');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.unshift({ lineno: 57, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="post-info"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 58, filename: __jade[0].filename });
buf.push('<a');
buf.push(' href="#"')
buf.push('>');
var __val__ = post.author || user.fullname || user.title
buf.push(escape(null == __val__ ? "" : __val__));
__jade.unshift({ lineno: 59, filename: __jade[0].filename });
__jade.unshift({ lineno: 59, filename: __jade[0].filename });
buf.push('<span>:');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</span>');
__jade.shift();
__jade.shift();
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</a>');
__jade.shift();
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.unshift({ lineno: 61, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="post-content"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 62, filename: __jade[0].filename });
if ( (! post.isMarkdown))
{
__jade.unshift({ lineno: 63, filename: __jade[0].filename });
__jade.unshift({ lineno: 63, filename: __jade[0].filename });
buf.push('<h1>' + escape((interp =  post.title ) == null ? '' : interp) + '');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</h1>');
__jade.shift();
__jade.shift();
}
__jade.shift();
__jade.unshift({ lineno: 64, filename: __jade[0].filename });
var __val__ = post.html
buf.push(null == __val__ ? "" : __val__);
__jade.shift();
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.unshift({ lineno: 66, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="post-controls right"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 67, filename: __jade[0].filename });
buf.push('<span');
buf.push(attrs({ 'title':("Reblog"), "class": ('icon') + ' ' + ('loop') + ' ' + ('clickable') + ' ' + ('tipsy') + ' ' + (false && 'fill') }));
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</span>');
__jade.shift();
__jade.unshift({ lineno: 70, filename: __jade[0].filename });
buf.push('<!-- span.icon.star.clickable.tipsy(class = false && \'fill\', title="Mark")-->');
__jade.shift();
__jade.unshift({ lineno: 72, filename: __jade[0].filename });
buf.push('<!-- TODO (personalize, fee, user icon) use card, heart as like, spade as dislike, club as share, diamond as favorit-->');
__jade.shift();
__jade.unshift({ lineno: 72, filename: __jade[0].filename });
buf.push('<span');
buf.push(attrs({ 'title':("Like"), "class": ('icon') + ' ' + ('heart') + ' ' + ('clickable') + ' ' + ('tipsy') + ' ' + (post.comInfo.isLike && 'fill') }));
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</span>');
__jade.shift();
__jade.unshift({ lineno: 73, filename: __jade[0].filename });
buf.push('<span');
buf.push(' class="icon none"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 75, filename: __jade[0].filename });
buf.push('<!-- TODO xxx participate in this post, 3 different way, choose 1, click head icon view his comments only-->');
__jade.shift();
__jade.unshift({ lineno: 76, filename: __jade[0].filename });
buf.push('<!-- 1. your friends participate-->');
__jade.shift();
__jade.unshift({ lineno: 77, filename: __jade[0].filename });
buf.push('<!-- 2. most rated participator, most comment participator, author, random users-->');
__jade.shift();
__jade.unshift({ lineno: 78, filename: __jade[0].filename });
buf.push('<!-- 3. all participators, maybe very much, thousounds, mouse over, docks style, gallary style-->');
__jade.shift();
__jade.unshift({ lineno: 79, filename: __jade[0].filename });
buf.push('<!-- 4. if topic is about a view point, you can agree or oppose his point, show participators in 2 group-->');
__jade.shift();
__jade.shift();
buf.push('</span>');
__jade.shift();
__jade.unshift({ lineno: 79, filename: __jade[0].filename });
buf.push('<span>xxx, xxx, xxx');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</span>');
__jade.shift();
__jade.unshift({ lineno: 80, filename: __jade[0].filename });
buf.push('<span');
buf.push(attrs({ 'title':("" + ( post.commentsCount || 'No' ) + " comments"), "class": ('show-comments') + ' ' + ('icon') + ' ' + ('comment-alt') + ' ' + ('clickable') + ' ' + ('tipsy') + ' ' + (post.commentsCount && 'fill') }));
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</span>');
__jade.shift();
__jade.unshift({ lineno: 86, filename: __jade[0].filename });
buf.push('<!--');
__jade.unshift({ lineno: 83, filename: __jade[0].filename });
__jade.unshift({ lineno: 83, filename: __jade[0].filename });
buf.push('<span');
buf.push(' class="icon none"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</span>');
__jade.shift();
__jade.unshift({ lineno: 84, filename: __jade[0].filename });
buf.push('<span');
buf.push(' title="Never show this again" class="icon close-icon clickable tipsy"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</span>');
__jade.shift();
__jade.shift();
buf.push('-->');
__jade.shift();
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.unshift({ lineno: 86, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="post-info"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 88, filename: __jade[0].filename });
buf.push('<!-- TODO fix time update problem-->');
__jade.shift();
__jade.unshift({ lineno: 88, filename: __jade[0].filename });
buf.push('<span');
buf.push(attrs({ 'date':("" + ( post.createTime.getTime() ) + ""), 'title':("" + ( post.createTime.format('yyyy-mm-dd HH:MM:ss') ) + ""), "class": ('tipsy') }));
buf.push('>');
var __val__ = smartDate(post.createTime)
buf.push(escape(null == __val__ ? "" : __val__));
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</span>');
__jade.shift();
__jade.unshift({ lineno: 89, filename: __jade[0].filename });
buf.push('&nbsp;&nbsp;\n');
__jade.shift();
__jade.unshift({ lineno: 90, filename: __jade[0].filename });
buf.push('<span');
buf.push(' class="post-controls"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 91, filename: __jade[0].filename });
// iterate ['cpp', 'node']
(function(){
  if ('number' == typeof ['cpp', 'node'].length) {
    for (var $index = 0, $$l = ['cpp', 'node'].length; $index < $$l; $index++) {
      var tag = ['cpp', 'node'][$index];

__jade.unshift({ lineno: 91, filename: __jade[0].filename });
__jade.unshift({ lineno: 92, filename: __jade[0].filename });
buf.push('<a');
buf.push(attrs({ 'href':("/tag/" + ( tag ) + ""), "class": ('tag') + ' ' + ("tag-" + ( tag ) + "") }));
buf.push('>');
var __val__ = tag
buf.push(escape(null == __val__ ? "" : __val__));
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</a>');
__jade.shift();
__jade.shift();
    }
  } else {
    for (var $index in ['cpp', 'node']) {
      var tag = ['cpp', 'node'][$index];

__jade.unshift({ lineno: 91, filename: __jade[0].filename });
__jade.unshift({ lineno: 92, filename: __jade[0].filename });
buf.push('<a');
buf.push(attrs({ 'href':("/tag/" + ( tag ) + ""), "class": ('tag') + ' ' + ("tag-" + ( tag ) + "") }));
buf.push('>');
var __val__ = tag
buf.push(escape(null == __val__ ? "" : __val__));
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</a>');
__jade.shift();
__jade.shift();
   }
  }
}).call(this);

__jade.shift();
__jade.unshift({ lineno: 93, filename: __jade[0].filename });
buf.push('<a');
buf.push(' href="/tag/mytag" class="tag tag-mytag"')
buf.push('>my-tag');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</a>');
__jade.shift();
__jade.unshift({ lineno: 94, filename: __jade[0].filename });
buf.push('<span');
buf.push(' class="clickable"')
buf.push('>&times;');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</span>');
__jade.shift();
__jade.unshift({ lineno: 95, filename: __jade[0].filename });
buf.push('<a');
buf.push(' href="/tag/mytag" class="tag tag-mytag"')
buf.push('>my-tag');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</a>');
__jade.shift();
__jade.unshift({ lineno: 96, filename: __jade[0].filename });
buf.push('<span');
buf.push(' class="clickable"')
buf.push('>&times;');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</span>');
__jade.shift();
__jade.unshift({ lineno: 97, filename: __jade[0].filename });
buf.push('<span');
buf.push(attrs({ 'title':("Add tags"), "class": ('icon') + ' ' + ('tag') + ' ' + ('clickable') + ' ' + ('tipsy') + ' ' + (false && 'fill') }));
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</span>');
__jade.shift();
__jade.shift();
buf.push('</span>');
__jade.shift();
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.unshift({ lineno: 100, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="comments"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.unshift({ lineno: 101, filename: __jade[0].filename });
buf.push('<div');
buf.push(' class="comment-list"')
buf.push('>');
__jade.unshift({ lineno: undefined, filename: __jade[0].filename });
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.shift();
buf.push('</div>');
__jade.shift();
__jade.shift();
}
return buf.join("");
} catch (err) {
  rethrow(err, __jade[0].filename, __jade[0].lineno);
}}