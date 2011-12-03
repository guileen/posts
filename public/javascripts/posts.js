$(function(){

    // New post
    var newPost = $('.new-post textarea');
    var preview = $('.new-post .preview');

    if(newPost.length===0 || preview.length===0){
      return;
    }

    var converter = new Showdown.converter();

    function refreshPreview(){
      var html = converter.makeHtml(newPost.val());
      preview.html(html);
    }

    refreshPreview();

    newPost.keyup(refreshPreview);

    // show new-post panel
    newPost.focusin(function(){
        $('.new-post .actions').fadeIn();
        $('.new-post .tips').fadeIn();
        $('.new-post .preview').fadeIn();
        $("#editor-help").fadeIn();

        if(newPost.hasClass('default')){

          var defaultContent = 'Header 1\n' +
                               '====\n' +
                               'Header 2\n' +
                               '----\n' +
                               '### Header 3\n' +
                               '**bold**, *italic*, _underline_, [web link](http://posts.li), `code`\n' +
                               '\n' +
                               '- item 1\n' +
                               '- item 2\n' +
                               '\n' +
                               '```\n' +
                               'code block\n' +
                               '```\n' +
                               '> quote text\n' +
                               '\n' +
                               '![images](http://dev:3000/images/logo-small.png)\n';

          newPost.val(defaultContent);
          refreshPreview();
          setTimeout(function(){
            newPost.select();
          }, 100);
        }

        // auto resize textarea when input
        newPost.autoResize({
            minHeight: 100,
            maxHeight: 300,
            extraSpace:16
        });
    });

    // prevent select all text if not first time click textarea
    newPost.change(function(){
        newPost.removeClass('default');
    });

    // collapse, close new-post panel
    $('.new-post .collapse').click(function(){
        if(newPost.hasClass('default')){
          newPost.val('');
        }
        newPost.css({height: 60});
        $('.new-post .actions').hide();
        $('.new-post .tips').hide();
        $('.new-post .preview').hide();
        $("#editor-help").hide();
        newPost.data('AutoResizer').destroy();
    });

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
            }
        });
    });


    $(".new-post form").ajaxForm({
        success : function(data, textStatus, xhr) {
          var html = $(data).hide();
          $("#posts-list").prepend(html);
          html.slideDown();
        }
    });

});
