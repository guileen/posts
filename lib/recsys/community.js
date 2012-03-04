// user is user:uId, feed:feedId
// item is book:bId, movie:mId

var config = require('../../config')
  , redis = config.redis
  , shorten = require('shorten')(redis)
  , async = require('async')
  ;


function _(err) {if (err) console.log(err.stack);}

// keep same with lua os.time(), no milliseccons
function now { return Math.floor(Date.now()) }

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


var _ITEMS          = ':items' // l
  , _COMMENTS       = ':comments' // l
    // TODO share, comment
    // user firends to items
  , _FRIENDS_COMMENTED_ = ':friends_commented:' // hash, friend -> comment. e.g. u0:friends_commented:item0 {u1:'item0#01', u2:'item0#02'}
    // UI: we can show friends comment information when we hover that tip
  , _FRIENDS_SHARED_ = ':friends_shared:' // hash, friend -> share. e.g. u0:friends_shared:item0 {u1:'item0@01', u2:'item0@02'}
    // UI: we can show friends share information when load the item or hover
    // user to items
  , _COMMENTED      = ':commented' // s
  , _SHARED         = ':shared' // s
  , _LIKE           = ':like' // s
  , _DISLIKE        = ':dislike' // s
  , _RATE_USERS     = ':rateusers' // z
    // TODO _RATE_ , fix SCRIPT_INCR_ITEM_RATE for user rate user
  , _RATE_          = ':rate:' // z u1:rate:u2  item -> rate
  , _RATE_ITEMS     = ':rateitems'
  , _UNREAD         = ':unread'
  , _FOLLOWING      = ':following'
  , _FOLLOWERS      = ':followers'
  , _POSTLINE       = ':postline'
  , _TIMELINE       = ':timeline'
  , _RATELINE       = ':rateline'
  ;

//TODO update item avg rate
var SCRIPT_INCR_ITEM_RATE = [
  'local user, item, incr = KEYS[1], KEYS[2], KEYS[3];'
  // incr user - item rate
, "local rate = redis.call('zincrby', user + ':rateitems', incr, item));"
  // get item owner
, "local owner = redis.call('hget', item, 'owner')"
  // get owner rate
, "local oldRate = redis.call('zscore', user .. ':rateusers', owner);"
, "local ratesum = redis.call('hincrby', item, 'ratesum', rate)"
, "local ratecount;"
, "if(oldRate == nil) then"
, "  ratecount = redis.call('hincrby', item, 'ratecount', 1);"
, "  oldRate = 0"
, "else"
, "  ratecount = redis.call('hget', item, 'ratecount')"
, 'end'
, "local avgrate = ratesum / ratecount"
, "redis.call('hset', item, 'avgrate', avgrate)"
  // calc new rate, 近似公式, ( avg * count + new ) / (count + 1)
, 'rate = (oldRate * 9 + rate) / 10;'
  // update owner rate
, "redis.call('zadd', user .. ':rateusers', rate, owner);"
, 'return rate;'
].join('\n');

// TODO refactor this
var SCRIPT_USER_POST_ITEM = [
  // start is the index of current operation followers pagine index
  "local user, item, start, time = KEYS[1], KEYS[2], KEYS[3], os.time();"
, "redis.call('llen', user + ':followers');"
  // TODO use workers
, "local followers = redis.call('zrange', user + ':followers', start, -1);"// stop should be start + 100, and pagine this operation in workers"
, "local itemavgrate, type = redis.call('hget', item, 'avgrate', 'type')"
, "local sixhour = math.floor(time / 31600)"
, "for i = 1, table.getn(followers) do"
, "  local follower = followers[i];"
, "  local userrate = redis.call('zscore', follower .. ':rateusers', user)"

  // === share with SCRIPT_USER_FOLLOW_USER
  // FIXME when user rate changes, next post item have diffrent rate
  // We must use a real Recommender system
, "  local itemrate = sixhour * 100 + userrate * 10 + itemavgrate;" // time mixup rate
, "  redis.call('zadd', follower .. ':rateline', itemrate, item)"
, "  redis.call('zadd', follower .. ':timeline', time, item)"
, "  if(type == 'important') then"
, "    redis.call('zadd', follower .. ':unread', itemrate, item)"
  // === end share

, "    redis.call('zremrangebyrank', follower .. ':unread', 1000, -1)"
, "  end"

, "  redis.call('zremrangebyrank', follower .. ':rateline', 1000, -1)"
, "  redis.call('zremrangebyrank', follower .. ':timeline', 1000, -1)"

, "end"
].join('\n');

// send top 100 items to followers
var SCRIPT_USER_FOLLOW_USER = [
  "local follower, user = KEYS[1], KEYS[2];"
, "local items = redis.call('zrange', user + ':postline', 0, 100)"
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
]

// =============
// social base
// =============
exports.follow = function(user, fuser, callback) {
  var time = now();
  redis.zscore(user + _FOLLOWING, fuser, function(err, score) {
      if(err) return callback(err);
      if(score == nil) {
        redis.multi()
        .zadd(user + _FOLLOWING, time, fuser)
        .zadd(fuser + _FOLLOWERS, time, user)
        // maybe not very good, but maybe effecient, recently following user get a high result show
        .zincrby(user + _RATE_USERS, FOLLOW_RATE, fuser)
        .eval(SCRIPT_USER_FOLLOW_USER, 2, user, fuser)
        .exec(callback);
      }
  })
};

exports.unfollow = function (user, fuser, callback) {
  redis.zscore(user + _FOLLOWING, fuser, function(err, score) {
      if(err) return callback(err);
      if(score ~= nil) {
        redis.multi()
        .zrem(user + _FOLLOWING, fuser)
        .zrem(fuser + _FOLLOWERS, user)

        // TODO remove items when unfollow someone
        // .zdiffstore(user + _RATELINE, user + _RATELINE, fuser + _POSTLINE)
        // .zdiffstore(user + _UNREAD, user + _UNREAD, fuser + _POSTLINE)
        // .zdiffstore(user + _TIMELINE, user + _TIMELINE, fuser + _TIMELINE)
        // maybe not very good, but maybe effecient, recently following user get a high result show
        .zincrby(user + _RATE_USERS, - FOLLOW_RATE, fuser)
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

exports.getTimeline = function (user, start, stop, callback) {
  redis.multi()
  .zcard(user + _TIMELINE)
  .zrange(user + _TIMELINE, start, stop, WITHSCORES)
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
  redis.multi()
  .hget(item)
  .sismember(user + _COMMENTED, item)
  .sismember(user + _LIKE, item)
  .sismember(user + _DISLIKE, item)
  .sismember(user + _SHARED, item)
  .exec(function(err, results) {
      if(err) return callback(err);

      var info = results[0];
      info.icommented = results[1];
      info.ilike = results[2];
      info.idislike = results[3];
      info.ishared = results[4];
      callback(null, info);
  });
};

exports.postItem = function(user, item, info, callback) {
  redis.lpush(user + _ITEMS, item, _);
  info.owner = user;
  info.time = now();
  redis.multi()
  .hset(item, info)
  .zadd(user + _POSTLINE, item)
  .eval(SCRIPT_USER_POST_ITEM, 3, user, item, 0)
  .exec(callback);
};

exports.commentItem = function(user, item, info, callback) {
  shorten.nextId('comment', function(err, id) {
      if (err) return callback(err);

      var comment = item + '#' + id;
      // comment is also an item
      // 'item:123#2#5'
      info.owner = user;
      info.time = now();
      redis.multi()
      .hset(comment, info)
      .lpush(user + _COMMENTS, comment)
      .sadd(user + _COMMENTED, item)
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
      info.time = now();
      // TODO set original owner
      // TODO update followers timeline
      redis.multi()
      .hset(share, info)
      .sadd(user + _SHARED, share)
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

// read an item for a long time get high score
exports.readItem = function(user, item, timescore, callback) {
  if(timescore ~= 0) {
    redis.multi()
    .zrem(user + _UNREAD, item)
    .eval(SCRIPT_INCR_ITEM_RATE, 3, user, item, timescore)
    .exec(callback);
  } else {
    redis.zrem(user + _UNREAD, item, callback);
  }
}
