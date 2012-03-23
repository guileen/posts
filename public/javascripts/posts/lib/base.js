var posts = posts || {};

posts.views = {
  _cache : {}
, load : function(template) {
    return jade.templates[template];
    // if(!this._cache[template]) {
    //   this._cache[template] = jst.compile($('#template-' + template).html());
    // }
    // return this._cache[template];
  }
, render : function(template, context) {
    for(var name in this) {
      context[name] = this[name];
    }
    return this.load(template)(context);
  }
, avatar : function(user, size) {
    if(user.favicon) {
      return user.favicon;
    } else if(user.email) {
      return posts.views.gravatar(user.email, size);
    }
  }
, gravatar: function(email, size) {
    var avatar = 'http://www.gravatar.com/avatar/' + md5(email) + '?d=retro';
    if(size){
      return avatar + '&s=' + size;
    }
    return avatar;
  }
, favicon: function(url) {
    var purl = parseUrl(url);
    if(purl) {
      return purl.root + '/favicon.ico';
    } else {
      return null;
    }
  }
}

// jst.filters.avatar = function(size) {
//   return function (user) {
//     return posts.views.avatar(user, size);
//   }
// }

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
