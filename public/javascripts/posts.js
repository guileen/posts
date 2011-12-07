$(function() {
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

    var editor = initEditor($editor, $('.editor .editor-bar') , refreshPreview);

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

    // Post comments
    $('.post').each(function(i, el) {
        var e = $(el),
            opened = false,
            showComments = e.find('.show-comments'),
            loading = e.children('.loading'),
            comments = e.children('.comments');

        showComments.click(function() {
            if (opened) {
              comments.slideUp();
              opened = false;
            } else {
              loading.slideDown();
              setTimeout(function() {
                  loading.slideUp();
                  comments.slideDown();
                  opened = true;
              }, 1000);
            }
        });
    });


    $(".new-post form").ajaxForm({
        success : function(data, textStatus, xhr) {
          var html = $(data).hide();
          $("#posts-list").prepend(html);
          closeEditor(function() {
              editor.reset();
              form.slug.value = '';
          });
          html.slideDown();
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

});
