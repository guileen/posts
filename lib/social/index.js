// user is user:uId, feed:feedId
// item is book:bId, movie:mId

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

var READ_SCORE      = 1
  , LONG_READ_SCORE = 1
  , INIT_RATE       = 0 // when first rate an user
  , WITHSCORES      = 'WITHSCORES'
  ;


    // TODO _RATE_ , fix SCRIPT_INCR_ITEM_RATE for user rate user
var _RATE_          = ':rate:' // z u1:rate:u2  item -> rate
  , _UNREAD         = ':unread'
    // TODO remove 3 lines to their service
  , _RATELINE       = ':rateline'
  ;


// show all user you may intrested, even you not following, maybe you are following, but it may not show
exports.getTopUsers = function(user, k, callback) {
  redis.zrange(user + _RATE_USERS, 0, k, callback)
};

exports.getReadedItems = function (user, start, stop, callback) {
  redis.multi()
  .zcard(user + _RATE_ITEMS)
  .zrange(user + _RATE_ITEMS, start, stop, WITHSCORES)
  .exec(callback);
}

exports.getUnreadItems = function (user, start, stop, callback) {
  redis.multi()
  .zcard(user + _UNREAD)
  .zrange(user + _UNREAD, start, stop, WITHSCORES)
  .exec(callback);
}

exports.getRateline = function (user, start, stop, callback) {
  redis.multi()
  .zcard(user + _RATELINE)
  .zrange(user + _RATELINE, start, stop, WITHSCORES)
  .exec(callback);
}

/**
 * @param {function(err, info)}
 *
 *  friends_commented, friends_shared, friends_like, friends_dislike
 */
exports.itemCommunityInfo = function(user, item, callback) {
  async.parallel([
      function(_callback) {
        rate.rateInfo(user, item, _callback);
      }
    // , function(_callback) {
    //     redis.multi()
    //     .hgetall(item)
    //     .sismember(user + _COMMENTED, item)
    //     .sismember(user + _SHARED, item)
    //     .exec(function(err, results) {
    //         if(err) return callback(new Error(err));

    //         var info = results[0];
    //         info.iCommented = results[1];
    //         info.isShared = results[2];
    //         callback(null, info);
    //     });
    //   }
    ], function(err, results) {
      if(err) return callback(err);
      var info = results[0];
      callback(err, info);
  });
};

// read an item for a long time get high score
exports.readItem = function(user, item, timescore, callback) {
  if(timescore != 0) {
    redis.multi()
    .zrem(user + _UNREAD, item)
    .eval(SCRIPT_INCR_ITEM_RATE, 3, user, item, timescore)
    .exec(callback);
  } else {
    redis.zrem(user + _UNREAD, item, callback);
  }
};

['./rate', './comment', './follow', './post'].forEach(function(file) {
    var _module = require(file);
    for(var name in _module) {
      exports[name] = _module[name];
    }
});
