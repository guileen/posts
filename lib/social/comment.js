var config = require('../../config')
  , redis = config.redis
  , shorten = require('shorten')(redis)
  , async = require('async')
  , logger = require('nlogger').logger(module)
  , utils = require('./utils')
  , rate = require('./rate')
  , print = utils.print
  , now = Date.now
  ;

var COMMENT_SCORE   = 1
  , SHARE_SCORE     = 1
  ;

var _COMMENTS       = ':comments' // l
    // TODO share, comment
    // user firends to items
  , _FRIENDS_COMMENTED_ = ':friends_commented:' // hash, friend -> comment. e.g. u0:friends_commented:item0 {u1:'item0#01', u2:'item0#02'}
    // UI: we can show friends comment information when we hover that tip
  , _FRIENDS_SHARED_ = ':friends_shared:' // hash, friend -> share. e.g. u0:friends_shared:item0 {u1:'item0@01', u2:'item0@02'}
    // UI: we can show friends share information when load the item or hover
    // user to items
  , _COMMENTED      = ':commented' // s
  , _SHARED         = ':shared' // s


exports.commentItem = function(user, item, info, callback) {
  shorten.nextId('comment', function(err, id) {
      if (err) return callback(err);

      var comment = item + '#' + id;
      // comment is also an item
      // 'item:123#2#5'
      info.owner = user;
      info.time = now();
      redis.pipe()
      .hmset(comment, info)
      .lpush(user + _COMMENTS, comment)
      .sadd(user + _COMMENTED, item)
      .incrItemRate(user, item, COMMENT_SCORE)
      .exec(callback);

  });
};

exports.shareItem = function(user, item, info, callback) {
  shorten.nextId('share', function(err, id) {
      if (err) return callback(err);

      var share = item + '@' + id;

      info.owner = user;
      info.item = item;
      info.time = now();
      // TODO set original owner
      // TODO update followers timeline
      redis.pipe()
      .hmset(share, info)
      .sadd(user + _SHARED, share)
      .incrItemRate(user, item, SHARE_SCORE)
      .exec(callback);

  });
};

