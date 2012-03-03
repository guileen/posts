// user is user:uId, feed:feedId
// item is book:bId, movie:mId

var config = require('../../config')
  , redis = config.redis
  , shorten = require('shorten')(redis)
  , async = require('async');


function _(err) {if (err) console.log(err.stack);}

var COMMENT_SCORE   = 1
  , SHARE_SCORE     = 1
  , LIKE_SCORE      = 1
  , READ_SCORE      = 1
  , LONG_READ_SCORE = 1
  , DISLIKE_SCORE   = -4
  , INIT_RATE       = 0 // when first rate an user
  , FOLLOW_RATE     = 2 // when you start follow user
  , WITHSCORES      = 'WITHSCORES'
  ;


var _ITEMS          = ':items'
  , _COMMENTS       = ':comments'
  , _SHARE          = ':share'
  , _LIKE           = ':like'
  , _DISLIKE        = ':dislike'
  , _RATE_USERS     = ':rateusers'
  , _RATE_ITEMS     = ':rateitems'
  , _UNREAD_ITEMS   = ':unreaditems'
  , _LONGREAD_ITEMS = ':longreaditems'
  , _FOLLOWING      = ':following'
  ;


// =============
// social base
// =============
exports.follow = function(user, fuser, callback) {
  redis.sismember(user + _FOLLOWING, fuser, function(err, ismember) {
      if(err) return callback(err);
      if(ismember == 0) {
        redis.multi()
        .sadd(user + _FOLLOWING, fuser)
        // maybe not very good, but maybe effecient, recently following user get a high result show
        .zincrby(user + _RATE_USERS, FOLLOW_RATE, fuser)
        .exec(callback);
      }
  })
};

// sort by favorit
exports.getFollowings = function(user, callback) {
  redis.smembers(user + _FOLLOWING, callback);
};

// show all user you may intrested, even you not following, maybe you are following, but it may not show
exports.getTopUsers = function(user, k, callback) {
  redis.zrange(user + _RATE_USERS, 0, k, callback)
};

// group by users weight, on client
exports.timeline = function(user) {

};

exports.getReadedItems = function (user, start, stop, callback) {
  redis.zrange(user + _RATE_ITEMS, start, stop, WITHSCORES, callback)
}

/**
 * @param {function(err, [owner, friends_commented, friends_shared, friends_like, friends_dislike])}
 */
exports.itemCommunityInfo = function(user, item, callback) {

};

var SCRIPT_INCR_ITEM_RATE = [
  'local user, item, incr = KEYS[1], KEYS[2], KEYS[3];'
  // incr user - item rate
, "local rate = redis.call('zincrby', user + ':rateitems', incr, item));"
  // get item owner
, "local owner = redis.call('hget', item, 'owner')"
  // get owner rate
, "local oldRate = redis.call('zscore', user .. ':rateusers', owner);"
  // calc new rate, 近似公式, ( avg * count + new ) / (count + 1)
, 'oldRate = oldRate or 0;'
, 'rate = (oldRate * 9 + rate) / 10;'
  // update owner rate
, "redis.call('zadd', user .. ':rateusers', rate, owner);"
, 'return rate;'
].join('\n');

exports.postItem = function(user, item, info, callback) {
  redis.lpush(user + _ITEMS, item, _);
  info.owner = user;
  redis.multi()
  .hset(item, info)
  .zadd(user + _POSTLINE, item)
  .exec(callback);
};

exports.commentItem = function(user, item, info, callback) {
  shorten.nextId('comment', function(err, id) {
      if (err) return callback(err);

      var comment = item + '#' + id;
      // comment is also an item
      // 'item:123#2#5'
      info.owner = user;
      redis.multi()
      .hset(comment, info)
      .lpush(user + _COMMENTS, comment)
      .eval(SCRIPT_INCR_ITEM_RATE, 3, user, item, COMMENT_SCORE)
      .exec(callback);

  });
};

exports.shareItem = function(user, item, info, callback) {
  shorten.nextId('share', function(err, id) {
      if (err) return callback(err);

      var share = item + '@' + id;

      info.owner = user;
      info.item = item;
      redis.multi()
      .hset(share, info)
      .lpush(user + _SHARE, share)
      .eval(SCRIPT_INCR_ITEM_RATE, user, item, SHARE_SCORE)
      .exec(callback);

  });
};

exports.likeItem = function(user, item, callback) {
  redis.sismember(user + _LIKE, item, function(err, islike) {
      if(islike === 0) {
        redis.sismember(user + _DISLIKE, item, function(err, dislike) {

        var multi = redis.multi()
        .sadd(user + _LIKE, item);

        var incr = LIKE_SCORE;
        if(dislike === 1) {
          // change from dislike to like, adjust score
          incr -= DISLIKE_SCORE;
          multi.srem(user + _DISLIKE, item);
        }
        multi.eval(SCRIPT_INCR_ITEM_RATE, 3, user, item, incr).exec(callback);
        });
      }
  });
};

exports.undoLikeItem = function(user, item, callback) {
  redis.sismember(user + _LIKE, item, function(err, islike) {
      if(islike === 1) {

        var multi = redis.multi()
        .srem(user + _LIKE, item)
        .eval(SCRIPT_INCR_ITEM_RATE, 3, user, item, - LIKE_SCORE)
        .exec(callback);
      }
  });
}

exports.dislikeItem = function(user, item, callback) {
  redis.sismember(user + _DISLIKE, item, function(err, dislike) {
      if(dislike === 0) {
        redis.sismember(user + _LIKE, item, function(err, islike) {

        var multi = redis.multi()
        .sadd(user + _DISLIKE, item);

        var incr = DISLIKE_SCORE;
        if(islike === 1) {
          // change from like to dislike, adjust score
          incr -= LIKE_SCORE;
          multi.srem(user + _LIKE, item);
        }
        multi.eval(SCRIPT_INCR_ITEM_RATE, 3, user, item, incr).exec(callback);
        });
      }
  });
};

exports.readItem = function(user, item, callback) {
  redis.zscore(user, item, function(err, score) {
      if(err) return callback(err);
      if(score == null) {
        redis.multi()
        .zrem(user + _UNREAD_ITEMS, item)
        .eval(SCRIPT_INCR_ITEM_RATE, 3, user, item, incr)
        .exec(callback);
      }
  })
}

exports.longreadItem = function(user, item) {
  redis.sismember(user, item, function(err, ismember) {
      if(err) return callback(err);
      if(score == 0) {
        redis.multi()
        .sadd(user + _LONGREAD_ITEMS, item)
        .eval(SCRIPT_INCR_ITEM_RATE, 3, user, item, incr)
        .exec(callback);
      }
  })
}
