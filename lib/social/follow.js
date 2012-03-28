var config = require('../../config')
  , redis = config.redis
  , shorten = require('shorten')(redis)
  , async = require('async')
  , logger = require('nlogger').logger(module)
  , utils = require('./utils')
  , rate = require('./rate')
  , print = utils.print
  , now = Date.now

  , _FOLLOWING      = ':following'
  , _FOLLOWERS      = ':followers'
  , FOLLOW_RATE     = 2 // when you start follow user


// send top 100 items to followers
var SCRIPT_USER_FOLLOW_USER = [
  "local follower, user = KEYS[1], KEYS[2];"
, "local items = redis.call('zrange', user .. ':postline', 0, 100)"
, "local userrate = redis.call('zscore', user .. ':rateusers', fuser)"
, "for i = 1, table.getn(items) do"
, "  local item = items[i];"
, "  local itemavgrate, type, time = redis.call('hget', item, 'avgrate', 'type', 'time')"
, "  local sixhour = math.floor(time / 31600)" // time is ms time

  // === copy from SCRIPT_USER_POST_ITEM, should keep same
  // FIXME when user rate changes, next post item have diffrent rate
  // We must use a real Recommender system
, "  local itemrate = sixhour * 100 + userrate * 10 + itemavgrate;" // time mixup rate
, "  redis.call('zadd', follower .. ':rateline', itemrate, item)"
, "  redis.call('zadd', follower .. ':timeline', time, item)"
, "  if(type == 'important') then"
, "    redis.call('zadd', follower .. ':unread', itemrate, item)"
  // === end copy

, "  end"
, "end"

, "redis.call('zremrangebyrank', follower .. ':rateline', 1000, -1)"
, "redis.call('zremrangebyrank', follower .. ':timeline', 1000, -1)"
, "redis.call('zremrangebyrank', follower .. ':unread', 1000, -1)"
].join('\n');

// =============
// social base
// =============
exports.follow = function(user, fuser, callback) {
  var time = now();
  redis.zscore(user + _FOLLOWING, fuser, function(err, score) {
      if(err) return callback(err);
      if(score == null) {
        redis.pipe()
        .zadd(user + _FOLLOWING, time, fuser)
        .zadd(fuser + _FOLLOWERS, time, user)
        // maybe not very good, but maybe effecient, recently following user get a high result show
        .incrRate(user, fuser, FOLLOW_RATE)
        .eval(SCRIPT_USER_FOLLOW_USER, 2, user, fuser, print)
        .exec(callback);
      }
  })
};

exports.unfollow = function (user, fuser, callback) {
  redis.zscore(user + _FOLLOWING, fuser, function(err, score) {
      if(err) return callback(err);
      if(score != nil) {
        redis.multi()
        .zrem(user + _FOLLOWING, fuser)
        .zrem(fuser + _FOLLOWERS, user)

        // TODO remove items when unfollow someone
        // .zdiffstore(user + _RATELINE, user + _RATELINE, fuser + _POSTLINE)
        // .zdiffstore(user + _UNREAD, user + _UNREAD, fuser + _POSTLINE)
        // .zdiffstore(user + _TIMELINE, user + _TIMELINE, fuser + _TIMELINE)
        // maybe not very good, but maybe effecient, recently following user get a high result show
        .incrRate(user, fuser, - FOLLOW_RATE)
        .exec(callback);
      }
  })
}

// sort by favorit
exports.getFollowings = function(user, start, stop, callback) {
  redis.zmembers(user + _FOLLOWING, start, stop, callback);
};

exports.getFollowers = function(user, start, stop, callback) {
  redis.zrange(user + _FOLLOWERS, start, stop, callback);
}
