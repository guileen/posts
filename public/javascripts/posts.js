$(function(){
    var newPost = $('.new-post textarea');
    var preview = $('.new-post .preview');
    var converter = new Showdown.converter();

    function refreshPreview(){
      var html = converter.makeHtml(newPost.val());
      preview.html(html);
    }

    refreshPreview();

    newPost.keyup(refreshPreview);

    // show new-post panel
    $('.new-post').focusin(function(){
        $('.new-post .actions').fadeIn();
        $('.new-post .tips').fadeIn();
        $('.new-post .preview').fadeIn();
        // auto resize textarea when input
        newPost.autoResize({
            minHeight: 100,
            maxHeight: 300,
            extraSpace:16
        });

        if(newPost.hasClass('default')){
          setTimeout(function(){
            newPost.select();
          }, 100);
        };
    });

    // prevent select all text if not first time click textarea
    newPost.change(function(){
        newPost.removeClass('default');
    });

    // collapse, close new-post panel
    $('.new-post .collapse').click(function(){
        $('.new-post .actions').hide();
        $('.new-post .tips').hide();
        $('.new-post .preview').hide();
        newPost.data('AutoResizer').destroy();
        newPost.css({height: 60});
    });

});
