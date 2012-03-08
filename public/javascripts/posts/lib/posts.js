// use js-signal?
posts.service = {
  user : null
, posts : null
, remove : function(id) {

  }
, share : function(id) {

  }
, reblog : function(id) {

  }
, comment : function(id) {

  }
, like : function(id) {

  }
, dislike : function(id) {

  }
}

posts.list = {

  // TODO ajaxSetup global
  remove : function (id) {
    $.post( '/post/' + id + '/remove', null, function(r) {
        if (r.success) {
          $('#rm-' + id).data('twipsy').$tip.remove();
          $('#rm-' + id).parents('.entry').slideUp(function() {
              $(this).remove();
          });
        }
    });
  }

, initTopEditor : function () {
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
        $(".lazy").slideDown();

        // auto resize textarea when input
        $editor.autoResize({
            // minHeight: 60,
            maxHeight: 300,
            extraSpace: 16
        });
    });

    function closeEditor(callback) {
      $editor.animate({height: 60});
      $(".lazy").slideUp(callback);
      $editor.data('AutoResizer').destroy();
    }

    // collapse, close new-post panel
    $('.new-post .collapse').click(closeEditor);

    /*
     * submit new post
     */
    $(".new-post form").ajaxForm({
        success : function(data, textStatus, xhr) {
          var $html = $(data).hide();
          posts.list.initEntry($html);
          $("#posts-list").prepend($html);
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

, initEntries : function () {
    $('.entry').each(function(i, el) {
        posts.list.initEntry(el);
    })
  }

, initEntry : function (entry) {
    var $entry = $(entry);

    $entry.find('.post').each(function(i, el) {
        new Post(el);
    });

  }

// TODO Post move to pages?
, initPost : function (el) {
    var $el, postId, opened, loaded;
  if(el instanceof HTMLElement) {

          $el = $(el);
          postId = $el.attr('data-id');
          opened = false;
          loaded = false;

  } else {
    // el is data
    postId = el.id;
    $el = $(posts.views.render('post-entry', el));
  }

      var $rm = $el.find('.icon.trash')
            , $showComments = $el.find('.show-comments')
            , $loading = $el.children('.loading')
            , $comments = $el.children('.comments')
            , $commentList = $comments.children('.comment-list');

      /* ==========================
       * remove post
       * ==========================*/
      $rm.popover({
          trigger:'manual'
        , html:true
        , placement : 'below'
        , content : function(){
            var id = this.id.substring(3);
            var hideSnip = "$('#rm-" + id + "').popover('hide')";
            var removeSnip = "posts.list.remove('" + id + "');";
            return '<p class="clearfix">Are you sure?</p><br>'
            + '<p style="text-align:center;">'
            + '<a class="btn" href="javascript:void(0)" onclick="' + removeSnip + hideSnip + '">Yes</a>'
            + '&nbsp;<a class="btn primary" onclick="' + hideSnip + '">No</a></p>'
          }
      });

      $rm.live('click', function(){
          $(this).popover('show');
      });



          // uncomment to support cover layer
          // var $cover = $('<div>')
          // $el.append($cover);
          // var pos = $el.position();
          // $cover.css({
          //     position: 'absolute'
          //   , left: pos.left
          //   , top : pos.top
          //   , width : $el.outerWidth()
          //   , height : $el.outerHeight()
          //   , zIndex : 0
          // });

          // $cover.click(openComments);
          $showComments.click(openComments);

          function openComments() {
              if (opened) {
                $comments.slideUp(function(){
                    opened = false;
                });
              } else if (loaded) {
                $comments.slideDown(function(){
                    opened = true;
                });
              } else {
                // loading.slideDown();
                // get latest top n comments, sort by user
                $.get('/post/' + postId + '/comments', {}, function(r) {
                    loaded = true;
                    updateCommentCount(r.commentsCount);
                    var $html = $(getCommentsHtml(r.comments));
                    $commentList.append($html);
                    // TODO loading icon
                    $loading.slideUp();
                    if(!opened) $comments.slideDown(function(){
                        opened = true;
                    });
                });
              }
          }

          function appendCommentForm(){
            var formHtml = posts.views.render('comment-form', { id: $el.attr('data-id'), operation: 'new', user: user});
            var $formHtml = $(formHtml);
            $form = $formHtml.find('form');
            $form.ajaxForm({
                success: function(r){
                  $formHtml.find('textarea').val('');
                  updateCommentCount(r.commentsCount);
                  var $html = $(getCommentsHtml(r.comments));
                  $html.hide();
                  $commentList.append($html);
                  $html.slideDown();
                }
            });
            $comments.append($formHtml);
          }

          appendCommentForm();

          function getCommentsHtml(comments) {
            var htmls = [];
            for(var i=0;i<comments.length;i++) {
              htmls.push(posts.views.render('comment', comments[i]));
            }
            return htmls.join('');
          }

          function updateCommentCount(count) {
            //TODO
          }

          // TODO show xxx is typing

          /* ================
           * modify
           * ================ */

          function postModifyReady($html) {
            var $preview = $html.find(".preview");
            var editor = posts.editor.create($html.find('textarea'), $html.find(".editor-bar"), function(html) {
                $preview.html(html);
                var title = $preview.children('h1,h2,h3,h4,h5,h6').first().text();
                $html.find('input[name="title"]').val(title);
            });

            // auto resize textarea when input
            $html.find('textarea').autoResize({
                // minHeight: 60,
                maxHeight: 300,
                extraSpace: 16
            });
          };

          var isModify = false;
          var isModifyLoaded = false;
          var $modifyHtml = null;
          $el.find('a.modify-post').bind('click', function(event){
              event.preventDefault();
              if(isModify) {
                $modifyHtml.slideUp();
                $el.find('.post-content').slideDown();
                isModify = false;
              } else if (isModifyLoaded) {
                $modifyHtml.slideDown();
                $el.find('.post-content').slideUp();
                isModify = true;
              } else {
                isModify = true;
                $.get('/api/post/'+postId, {fields: 'revisions,title,html'}, function(data){
                    isModifyLoaded = true;
                    var html = posts.views.render('modify-post', data);
                    $modifyHtml = $(html);
                    $modifyHtml.hide();
                    $el.find('.post-content').before($modifyHtml);
                    $el.find('.post-content').slideUp();
                    postModifyReady($modifyHtml);
                    $modifyHtml.slideDown();
                });
              }
          });
  }

}
