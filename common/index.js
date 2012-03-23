var crypto = require('crypto');
require('./dateformat');

var smartdate = require('./smartdate.js');

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

, smartDate : smartdate.smartDate

, simpleDate : smartdate.simpleDate

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
