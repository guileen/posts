$.fn.extend({

    mkdInsertLink : function(url, description, image) {
      var el = this[0];
      var data = el.dataLinks = el.dataLinks || {};
      var num = data[url];
      if (!num) {
        num = el.dataNumLinks = (el.dataNumLinks | 0) + 1;
        data[url] = num;
        if (num === 1) el.value += '\n';
        el.value += '\n  [' + num + ']: ' + url;
      }
      var left = image ? '![' : '[';
      var right = ']';
      var defaultDescription = description || 'Enter your description';

      if (document.selection) {
        el.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
        el.focus();
      }
      else if (el.selectionStart !== undefined) {
        var startPos = el.selectionStart;
        var endPos = el.selectionEnd;
        var scrollTop = el.scrollTop;

        var insertText = el.value.substring(startPos, endPos) || defaultDescription;

        if (endPos > startPos) {
          var endStr = el.value.substring(endPos);
          var m = endStr.match(/\]\[\d+\]/);
          if (m) {
            insertText = defaultDescription;
            startPos = endPos += m[0].length;
          }
        }
        el.value = el.value.substring(0, startPos) + left + insertText + right + '[' + num + ']' + el.value.substring(endPos, el.value.length);
        el.select();
        el.selectionStart = startPos + left.length;
        el.selectionEnd = startPos + insertText.length + left.length;
        el.scrollTop = scrollTop;
      }
    }

  , mkdIndent : function(indent/* = '    ' */) {

    }

  , indentText : function(text, indent) {
      return text.split('\n').map(function(value) {
          return indent + value;
      });
    }
});


/**
 * default load plugins
 */
$(function() {
    // default pjax, currently just test
    $('a.pjax').pjax('.content .next', {
        fragment: '.content .current'
    }).live('click', function() {
        $('.content .current').slideUp().removeClass('current');
        $('.content').append('<div class="current"></div>');
    });
    $('.content .current')
    .bind('pjax:start', function() {
        console.log('pjax:start');
    }).bind('pjax:end',   function() {
        console.log('pjax:end');
        $('.content .next').addClass('current');
    });

    $("form.search").focusin(function() {
        $("form.search input").animate({width: 450});
    }).focusout(function() {
        $("form.search input").animate({width: 150});
    });

    $(".tipsy").twipsy({
        live: true
    });

    // init notify
    window.$notify = $('#notify-container').notify();
});

