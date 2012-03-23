if(!$.support.pjax) {
  window.history.replaceState = window.history.pushState = $.noop();
}

// underscore template
_ = {}
// By default, Underscore uses ERB-style template delimiters, change the
// following template settings to use alternative delimiters.
_.templateSettings = {
  evaluate    : /{%([\s\S]+?)%}/g,
  interpolate : /{{([\s\S]+?)}}/g
};

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
_.template = function(str, data) {
  var c  = _.templateSettings;
  var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
    'with(obj||{}){__p.push(\'' +
    str.replace(/\\/g, '\\\\')
       .replace(/'/g, "\\'")
       .replace(c.interpolate, function(match, code) {
         return "'," + code.replace(/\\'/g, "'") + ",'";
       })
       .replace(c.evaluate || null, function(match, code) {
         return "');" + code.replace(/\\'/g, "'")
                            .replace(/[\r\n\t]/g, ' ') + "__p.push('";
       })
       .replace(/\r/g, '\\r')
       .replace(/\n/g, '\\n')
       .replace(/\t/g, '\\t')
       + "');}return __p.join('');";
  var func = new Function('obj', tmpl);
  return data ? func(data) : func;
};

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

  $("form.search").focusin(function() {
      $("form.search input").animate({width: 350});
  }).focusout(function() {
      $("form.search input").animate({width: 100});
  });

  // init notify
  window.$notify = $('#notify-container').notify();

  posts.initPlugins($(document));

});

