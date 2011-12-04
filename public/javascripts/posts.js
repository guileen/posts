$(function(){

    // New post
    var newPost = $('.new-post textarea');
    var preview = $('.new-post .preview');
    var form = document.forms.post;

    if(newPost.length===0 || preview.length===0){
      return;
    }

    var converter = new Showdown.converter();

    var lastTitle;
    function refreshPreview(){
      var html = converter.makeHtml(newPost.val());
      preview.html(html);
      var title = preview.children('h1,h2,h3,h4,h5,h6').first().text();
      if(title != lastTitle) {
        lastTitle = title;
        form.title.value = title;
        form.slug.value = title.toLowerCase().replace(/[\s'",?&]+/g, '-');
      }
    }

    refreshPreview();

    //TODO make it a little delay, don't refresh too fast
    newPost.keyup(refreshPreview);

    // show new-post panel
    newPost.focusin(function(){
        $(".lazy").fadeIn();

        // auto resize textarea when input
        newPost.autoResize({
            minHeight: 100,
            maxHeight: 300,
            extraSpace:16
        });
    });

    function closeEditor(){
        newPost.css({height: 60});
        $(".lazy").hide();
        newPost.data('AutoResizer').destroy();
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
              newPost.mkdInsertLink(data.url, data.filename, data.mime.indexOf('image/') === 0);
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
          newPost.val('');
          refreshPreview();
        }
    });

});
