$(function(){

    // New post
    var $preview = $('.new-post .preview');
    var form = document.forms.post;
    var $editor = $(form.content);

    if($editor.length===0 || $preview.length===0){
      return;
    }

    var converter = new Showdown.converter();

    var lastTitle;
    function refreshPreview(){
      var html = converter.makeHtml($editor.val());
      $preview.html(html);
      var title = $preview.children('h1,h2,h3,h4,h5,h6').first().text();
      if(!title) {
        form.description.value = $preview.text().replace(/\n/g, '').substring(0,100) + ' [url]';
      } else if(title != lastTitle) {
        lastTitle = title;
        form.title.value = title;
        form.slug.value = title.toLowerCase().replace(/[\s'",?&]+/g, '-');
        form.description.value = title + ' [url]';
      }
    }

    refreshPreview();

    //TODO make it a little delay, don't refresh too fast
    $editor.keyup(refreshPreview);

    // show new-post panel
    $editor.focusin(function(){
        $(".lazy").fadeIn();

        // auto resize textarea when input
        $editor.autoResize({
            // minHeight: 100,
            maxHeight: 300,
            extraSpace:16
        });
    });

    function closeEditor(){
        $editor.css({height: 60});
        $(".lazy").hide();
        $editor.data('AutoResizer').destroy();
    }

    // collapse, close new-post panel
    $('.new-post .collapse').click(closeEditor);

    // Post comments
    $('.post').each(function(i, el){
        var e = $(el),
            opened = false,
            showComments = e.find('a.show-comments'),
            loading = e.children('.loading'),
            comments = e.children('.comments');

        showComments.click(function(){
            if(opened){
              comments.slideUp();
              opened = false;
            } else {
              loading.slideDown();
              setTimeout(function(){
                  loading.slideUp();
                  comments.slideDown();
                  opened = true;
              }, 1000);
            }
        });
    });

    $("#btn-upload").click(function(){
        console.log('hello');
        $("#input-file").click();
    });

    $("#input-file").change(function(){
        $("#upload-form").ajaxSubmit({
            success:function(data){
              console.log(data);
              $editor.mkdInsertLink(data.url, data.filename, data.mime.indexOf('image/') === 0);
              refreshPreview();
            }
        });
    });


    $(".new-post form").ajaxForm({
        success : function(data, textStatus, xhr) {
          closeEditor();
          var html = $(data).hide();
          $("#posts-list").prepend(html);
          html.slideDown();
          $editor.val('');
          refreshPreview();
        }
    });

    $(form.description).focus(function(){
        var self = this;
        setTimeout(function(){
            self.select();
            self.selectionStart = 0;
            var i = self.value.indexOf('[url]');
            self.selectionEnd = self.value[i - 1] == ' ' ? i - 1 : i;
        }, 50);
    });

});
