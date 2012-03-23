// use js-signal?
posts.api = {
  user: null
, posts: null
, feeds: {}
, users: {}

, ajax: function(url, method, params, callback) {
    if(!callback && typeof params === 'function') {
      callback = params;
      params = null;
    }
    $.ajax(url, {
        type: method
      , data: params
      , success: function(data, textStatus, jqxhr) {
          callback(null, data);
        }
      , error: function(jqxhr, textStatus, err) {
          callback(err);
        }
    });
  }

, get: function(url, params, callback) {
    this.ajax(url, 'get', params, callback);
  }

, post: function(url, params, callback) {
    this.ajax(url, 'post', params, callback);
  }

, remove: function(id) {

  }

, share: function(id) {

  }

, reblog: function(id) {

  }

, comment: function(id) {

  }

, like: function(id) {

  }

, dislike: function(id) {

  }

, loadTimeline: function(start, len, callback) {
    $.get('/api/post/timeline/' + start + '/' + len, callback);
  }

, loadUsers: function(uids, callback) {
    var _uids = [];
    for(var i in uids) {
      var u = uids[i];
      if(_uids.indexOf(u) < 0 && !posts.api.users[u]) {
        _uids.push(u);
      }
    }
    if(_uids.length > 0) {
      this.get('/api/user/mget', {users: _uids}, function(err, data) {
          data.forEach(function(u){ posts.api.users[u._id] = u; });
          var result = uids.map(function(uid) {return posts.api.users[uid]})
          callback(null, result);
      });
    } else {
      var result = uids.map(function(uid) {return posts.api.users[uid]})
      callback(null, result);
    }
  }

, loadFeeds: function(fids, callback) {

    var _fids = [];
    for(var i in fids) {
      var f = fids[i];
      if(_fids.indexOf(f) < 0 && !posts.api.feeds[f]) {
        _fids.push(f);
      }
    }
    if(_fids.length > 0) {
      this.get('/api/feed/mget', {feeds: _fids}, function(err, data) {
          data.forEach(function(f){ posts.api.feeds[f.id] = f; });
          var result = fids.map(function(fid) {return posts.api.feeds[fid]})
          callback(null, result);
      });
    } else {
      var result = fids.map(function(fid) {return posts.api.feeds[fid]})
      callback(null, result);
    }
  }
};

posts.list = {

  timelineIndex: 0

, ratelineIndex: 0

  // TODO ajaxSetup global
, remove: function(id) {
    $.post('/api/post/' + id + '/remove', null, function(r) {
        if (r.success) {
          $('#rm-' + id).parents('.entry').slideUp(function() {
              $(this).remove();
          });
          $('#rm-' + id).data('tooltip').$tip.remove();
        }
    });
  }

, initTopEditor: function() {
    // TODO editor support <c-z> undo, redo

    // New post
    var $preview = $('.new-post .preview');
    var form = document.forms.post;
    var $editor = $(form.content);

    if ($editor.length === 0 || $preview.length === 0) {
      return;
    }


    function refreshPreview(html) {
      $preview.html(html);
      var title = $preview.children('h1,h2,h3,h4,h5,h6').first().text();
      if (title) {
        form.description.value = 'Post "' + title + '" [url]';
      } else {
        form.description.value = $preview.text().replace(/\n/g, '').substring(0, 100) + ' [url]';
      }
      form.title.value = title;
      form.slug.value = title.toLowerCase().replace(/[\s'",?&]+/g, '-');
    }

    var editor = posts.editor.create($editor, $('.editor .editor-bar') , refreshPreview);

    // show new-post panel
    $editor.focusin(function() {
        $('.lazy').slideDown();

        // auto resize textarea when input
        $editor.autoResize({
            // minHeight: 60,
            maxHeight: 300,
            extraSpace: 16
        });
    });

    function closeEditor(callback) {
      $editor.animate({height: 60});
      $('.lazy').slideUp(callback);
      $editor.data('AutoResizer').destroy();
    }

    // collapse, close new-post panel
    $('.new-post .collapse').click(closeEditor);

    /*
     * submit new post
     */
    $('.new-post form').ajaxForm({
        success: function(data, textStatus, xhr) {
          var $html = $(data).hide();
          posts.list.initEntry($html);
          $('#posts-list').prepend($html);
          closeEditor(function() {
              editor.reset();
              form.slug.value = '';
          });
          $html.slideDown();
        }
    });

    $(form.description).focus(function() {
        var self = this;
        setTimeout(function() {
            self.select();
            self.selectionStart = 0;
            var i = self.value.indexOf('[url]');
            self.selectionEnd = self.value[i - 1] == ' ' ? i - 1 : i;
        }, 50);
    });
  }

, loadTimeline: function(len) {
    len = len || 10;
    posts.api.loadTimeline(this.timelineIndex, len, function(plist) {
        posts.list.timelineIndex += plist.length;
        posts.list.renderPosts(plist);
    });
  }

, renderPosts: function(plist) {
    var uids = [], fids = [];
    plist.forEach(function(pdata) {
        if(pdata.isFeed) {
          fids.push(pdata.feed);
        } else {
          uids.push(pdata.authorId);
        }
    });

    async.parallel([
        function(_callback) {
          posts.api.loadFeeds(fids, _callback);
        }
      , function(_callback) {
          posts.api.loadUsers(uids, _callback);
        }
      ], function(err, data) {
        // user and feeds has load
        var $list = this.$list || (this.$list = $('#posts-list'));
        plist.forEach(function(pdata) {
            var user = pdata.isFeed ? posts.api.feeds[pdata.feed] : posts.api.users[pdata.authorId];
            $list.append(new Post(pdata, user).$el);
        });
    });

  }

, initEntries: function() {
    $('.entry').each(function(i, el) {
        posts.list.initEntry(el);
    });
  }

, initEntry: function(entry) {
    var $entry = $(entry);

    $entry.find('.post').each(function(i, el) {
        var p = new Post(el);
        p.init();
    });

  }

};

// TODO Post move to pages?
function Post(data, user) {

  if (data instanceof HTMLElement) {
    this.$el = $(data);
    this.pid = this.$el.attr('data-id');
    this.data = {
      id: this.pid
    }
  } else {
    // el is data
    this.pid = data._id;
    this.data = data;
    this.user = user;
    this.$el = $(posts.views.render('posts/entry-tpl.jade', {
          post: data
        , user: user
    }));
  }

}

Post.prototype = {

  init: function() {
    this.initRemove();
    this.initComment();
    this.initModify();
    this.initShare();
    this.initLink();
    this.initLike();
    this.initDislike();
    this.initReblog();
    this.initMark();
  }

, initShare: function() {

  }

, initLink: function() {

  }

, initLike: function() {
    var self = this;
    var $like = this.$el.find('.icon.heart');
    $like.on('click', function() {
        var url = '/api/post/' + self.pid + '/like/' + ($like.hasClass('fill') ? '0' : '1');
        $.post(url, null, function(data) {
          $like.toggleClass('fill');
        })
    })
  }

, initDislike: function() {

  }

, initReblog: function() {

  }

, initMark: function() {

  }

, initRemove: function() {
    var self = this;
    var $rm = this.$el.find('.icon.trash');

    /* ==========================
     * remove post
     * ==========================*/
    $rm.popover({
        trigger: 'manual'
      , html: true
      , placement: 'bottom'
      , content: function() {
          return posts.views.render('remove-post', self.data);
        }
    });

    $rm.live('click', function() {
        $(this).popover('show');
    });
  }

, initComment: function() {

    this.$showComments = this.$el.find('.show-comments')
    this.$loading = this.$el.children('.loading')
    this.$comments = this.$el.children('.comments')
    this.$commentList = this.$comments.children('.comment-list');

    // uncomment to support cover layer
    // var $cover = $('<div>')
    // this.$el.append($cover);
    // var pos = this.$el.position();
    // $cover.css({
    //     position: 'absolute'
    //   , left: pos.left
    //   , top : pos.top
    //   , width : this.$el.outerWidth()
    //   , height : this.$el.outerHeight()
    //   , zIndex : 0
    // });

    // $cover.click(openComments);
    this.$showComments.click(this.openComments.bind(this));
  }

, openComments: function() {

    var self = this;
    if (this.commentsOpened) {
      this.$comments.slideUp(function() {
          self.commentsOpened = false;
      });
    } else if (this.commentsLoaded) {
      this.$comments.slideDown(function() {
          self.commentsOpened = true;
      });
    } else {
      // loading.slideDown();
      // get latest top n comments, sort by user
      $.get('/api/post/' + this.pid + '/comments', {}, function(r) {
          self.commentsLoaded = true;
          self.updateCommentCount(r.commentsCount);
          var $html = $(self.getCommentsHtml(r.comments));
          self.$commentList.append($html);
          // TODO loading icon
          self.$loading.slideUp();
          if (!self.commentsOpened) self.$comments.slideDown(function() {
              self.commentsOpened = true;
          });
      });
      self.appendCommentForm();
    }
  }

, appendCommentForm: function() {

    var formHtml = posts.views.render('comment-form', { id: this.$el.attr('data-id'), operation: 'new', user: user});
    var $formHtml = $(formHtml);
    $form = $formHtml.find('form');
    $form.ajaxForm({
        success: function(r) {
          $formHtml.find('textarea').val('');
          updateCommentCount(r.commentsCount);
          var $html = $(getCommentsHtml(r.comments));
          $html.hide();
          $commentList.append($html);
          $html.slideDown();
        }
    });
    this.$comments.append($formHtml);
  }

, getCommentsHtml: function(comments) {
    var htmls = [];
    for (var i = 0; i < comments.length; i++) {
      htmls.push(posts.views.render('comment', comments[i]));
    }
    return htmls.join('');
  }

, updateCommentCount: function(count) {
    //TODO
  }

  // TODO show xxx is typing

  /* ================
   * modify
   * ================ */

, postModifyReady: function($html) {
    var self = this;

    this.$preview = $html.find('.preview');
    this.editor = posts.editor.create($html.find('textarea'), $html.find('.editor-bar'), function(html) {
        self.$preview.html(html);
        var title = self.$preview.children('h1,h2,h3,h4,h5,h6').first().text();
        $html.find('input[name="title"]').val(title);
    });

    // auto resize textarea when input
    $html.find('textarea').autoResize({
        // minHeight: 60,
        maxHeight: 300,
        extraSpace: 16
    });

  }

, initModify: function() {
    var self = this;

    this.$el.find('a.modify-post').bind('click', function(event) {
        event.preventDefault();
        if (self.isModify) {
          self.$modifyHtml.slideUp();
          self.$el.find('.post-content').slideDown();
          self.isModify = false;
        } else if (self.isModifyLoaded) {
          self.$modifyHtml.slideDown();
          self.$el.find('.post-content').slideUp();
          self.isModify = true;
        } else {
          self.isModify = true;
          $.get('/api/post/' + self.pid, {fields: 'revisions,title,html'}, function(data) {
              self.isModifyLoaded = true;
              var html = posts.views.render('modify-post', data);
              self.$modifyHtml = $(html);
              self.$modifyHtml.hide();
              self.$el.find('.post-content').before(self.$modifyHtml);
              self.$el.find('.post-content').slideUp();
              self.postModifyReady(self.$modifyHtml);
              self.$modifyHtml.slideDown();
          });
        }
    });

  }
};
