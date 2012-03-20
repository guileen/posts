var crypto = require('crypto');
require('./dateformat');

function hash(algorithm, str){
  var hash = crypto.createHash(algorithm);
  hash.update(str);
  return hash.digest('hex');
}

module.exports = {
  hash : hash
, md5 : function(str) {
    return hash('md5', str);
  }
, sha1 : function(str) {
    return hash('sha1', str);
  }
, avatar : function(md5, size) {
    var avatar = 'http://www.gravatar.com/avatar/' + md5 + '?d=retro';
    if(size){
      return avatar + '&s=' + size;
    }
    return avatar;
  }

, formatSeconds: function(s, def) {
    var d, h, m;
    if (s < 120) {
      return 'Just now';
    }
    m = Math.floor(s / 60);
    if (m < 60) {
      return m + ' minutes ago';
    }
    h = Math.floor(m / 60);
    if (h === 1) {
      return h + ' hour ago';
    }
    if (h < 24) {
      return h + ' hours ago';
    }
    d = Math.floor(h / 24);
    if (d === 1) {
      return 'yesterday';
    }
    if (d < 11) {
      return d + ' days ago';
    }
    return def;
  }

, simpleDate: function(date) {
    var centuryDate, centuryNow, delta, format, now, s;
    now = new Date();
    delta = now - date;
    s = delta / 1000;
    if (now.getDate() === date.getDate() && s < 24 * 3600) {
      format = 'HH:MM';
    } else if (now.getYear() === date.getYear()) {
      format = 'mm-dd';
    } else {
      centuryNow = Math.floor(now.getFullYear() / 100);
      centuryDate = Math.floor(date.getFullYear() / 100);
      if (centuryNow === centuryDate) {
        format = 'yy-mm-dd';
      } else {
        format = 'yyyy-mm-dd';
      }
    }
    return date.format(format);
  }

, smartDate: function(date) {
    var centuryDate, centuryNow, delta, format, now, s;
    now = new Date();
    delta = now - date;
    s = delta / 1000;

    var d, h, m;
    if (s < 120) {
      return 'Just now';
    }
    m = Math.floor(s / 60);
    if (m < 60) {
      return m + ' minutes ago';
    }
    h = Math.floor(m / 60);
    if (h === 1) {
      return h + ' hour ago';
    }
    if (h < 10) {
      return h + ' hours ago';
    }
    var d_now = Math.floor(now.getTime()/(24 * 3600 * 1000));
    var d = Math.floor(date.getTime()/(24 * 3600 * 1000));
    d = d_now - d;

    if(d === 0) {
      format = 'HH:MM';
    } else if (d === 1) {
      return 'yesterday';
    } else if (d < 10) {
      return d + ' days ago';
    } else if (now.getYear() === date.getYear()) {
      format = 'mm-dd';
    } else {
      centuryNow = Math.floor(now.getFullYear() / 100);
      centuryDate = Math.floor(date.getFullYear() / 100);
      if (centuryNow === centuryDate) {
        format = 'yy-mm-dd';
      } else {
        format = 'yyyy-mm-dd';
      }
    }
    return date.format(format);
  }

, urlRemoveTag: function(tagInfos, tagName) {
    var tag;
    return '/tag/' + ((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = tagInfos.length; _i < _len; _i++) {
            tag = tagInfos[_i];
            if (tag.name !== tagName) {
              _results.push(tag.name);
            }
          }
          return _results;
    })()).join('+');
  }

, urlAddTag: function(tagInfos, tagName) {
    var tag, tags, _i, _len;
    tags = [];
    for (_i = 0, _len = tagInfos.length; _i < _len; _i++) {
      tag = tagInfos[_i];
      tags.push(tag.name);
    }
    tags.push(tagName);
    return '/tag/' + tags.join('+');
  }

, isModerator: function(user) {
    return user.groups && user.groups.indexOf('moderator')>=0;
  }

};
