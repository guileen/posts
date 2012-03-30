$(function() {
    posts.page.initTopEditor();
    // posts.page.loadTimeline();
    posts.page.loadAuthorlineWithPost();
    posts.page.loadNextUserPost();

    var $win = $(window)
      , $doc = $(document);

    function scrollalert() {
      var scrolltop = $doc.scrollTop();
      var scrollheight = $doc.height();
      var windowheight = $win.height();

      var scrolloffset = 20;

      if (scrolltop + windowheight + scrolloffset >= scrollheight)
      {
        /// end
        $('#posts-loading').show();
        posts.page.loadNextUserPost();
      }
    }

    $('#posts-loading').hide();

    $win.bind('scroll', scrollalert);


});
