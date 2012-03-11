var posts = posts || {};

posts.views = {
  _cache : {}
, load : function(template) {
    if(!this._cache[template]) {
      this._cache[template] = Mustache.compile($('#template-' + template).html());
    }
    return this._cache[template];
  }
, render : function(template, context) {
    return this.load(template)(context);
  }
, avatar : function(user, size) {
    if(user.isFeed) {
      return user.favicon;
    } else {
      return gravatr(user.email, size)
    }
  }
, gravatr: function(email, size) {
    var avatar = 'http://www.gravatar.com/avatar/' + md5(email) + '?d=retro';
    if(size){
      return avatar + '&s=' + size;
    }
    return avatar;
  }
}

posts.initPlugins = function() {

  // // if you want to test unsupported browser, uncomment below
  // $.pjax = function( options ) {
  //   window.location = $.isFunction(options.url) ? options.url() : options.url
  // }
  // $.fn.pjax = function() { return this }

  // default pjax, currently just test
  $('a.pjax').pjax('#content', {
      // fragment: '#content'
  }).live('click', function() {
      $('.content .current').slideUp().removeClass('current');
      $('.content').append('<div class="current"></div>');
      $.twipsy.hideAll();
  });
  // $('.content .current')
  // .bind('pjax:start', function() {
  //     console.log('pjax:start');
  // }).bind('pjax:end',   function() {
  //     console.log('pjax:end');
  //     $('.content .next').addClass('current');
  // });

  $("form.search").focusin(function() {
      $("form.search input").animate({width: 350});
  }).focusout(function() {
      $("form.search input").animate({width: 100});
  });

  $(".tipsy").tooltip({
      live: true
  });

  // init notify
  window.$notify = $('#notify-container').notify();
}
