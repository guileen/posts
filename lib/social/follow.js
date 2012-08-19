var config = require('../../config')
  , redis = config.redis
  , clients = [redis]
  , shorten = require('shorten')(redis)
  , async = require('async')
  , logger = require('nlogger').logger(module)
  , utils = require('./utils')
  , rate = require('./rate')
  , print = utils.print
  , now = Date.now
  , WITHSCORES      = 'WITHSCORES'

  , _FOLLOWING      = ':following'
  , _FOLLOWERS      = ':followers'
  , FOLLOW_RATE     = 2 // when you start follow user

  , _ITEMS          = ':items' // l
  , _POSTLINE       = ':postline'
  , _TIMELINE       = ':timeline'
  , _AUTHORLINE     = ':authorline'
  , _UNREAD_        = ':unread:'
  , _READ_          = ':read:'
  ;

// // send top 100 items to followers
// var SCRIPT_USER_FOLLOW_USER = [
//   "local follower, user = KEYS[1], KEYS[2];"
// , "local items = redis.call('zrange', user .. ':postline', 0, 100)"
// , "local userrate = redis.call('zscore', user .. ':rateusers', fuser)"
// , "for i = 1, table.getn(items) do"
// , "  local item = items[i];"
// , "  local itemavgrate, type, time = redis.call('hget', item, 'avgrate', 'type', 'time')"
// , "  local sixhour = math.floor(time / 31600)" // time is ms time

//   // === copy from SCRIPT_USER_POST_ITEM, should keep same
//   // FIXME when user rate changes, next post item have diffrent rate
//   // We must use a real Recommender system
// , "  local itemrate = sixhour * 100 + userrate * 10 + itemavgrate;" // time mixup rate
// , "  redis.call('zadd', follower .. ':rateline', itemrate, item)"
// , "  redis.call('zadd', follower .. ':timeline', time, item)"
// , "  if(type == 'important') then"
// , "    redis.call('zadd', follower .. ':unread', itemrate, item)"
//   // === end copy

// , "  end"
// , "end"

// , "redis.call('zremrangebyrank', follower .. ':rateline', 1000, -1)"
// , "redis.call('zremrangebyrank', follower .. ':timeline', 1000, -1)"
// , "redis.call('zremrangebyrank', follower .. ':unread', 1000, -1)"
// ].join('\n');

// ********************** follow/unfollow **********************

exports.follow = function(user, tofollow, callback) {
  var time = now();

  // keys
  var timeline   = user     + _TIMELINE
    , unread     = user     + _UNREAD_   + tofollow
    , postline   = tofollow + _POSTLINE
    , readed     = user     + _READ_     + tofollow
    , following  = user     + _FOLLOWING
    , followers  = tofollow + _FOLLOWERS
    , authorline = user     + _AUTHORLINE
    ;

  redis.zscore(user + _FOLLOWING, tofollow, function(err, score) {
      if(err) return callback(err);
      if(score == null) {
        console.log(user + ' is following to ' + tofollow);
        redis.pipe()
        .zadd(following, time, tofollow)
        .zadd(followers, time, user)
        .incrRate(user, tofollow, FOLLOW_RATE)
        // ---- put unread items to user timeline
        // zdiffstore is not support yet
        // TODO .zdiffstore(timeline, 2, postline, readed)
        .zinterstore(timeline, 1, postline)
        // trim timeline and unread ??
        //
        // .eval(SCRIPT_USER_FOLLOW_USER, 2, user, tofollow, print)
        .exec(print);

        // ---- put unread items to user-user-unread line
        // TODO redis.zdiffstore(unread, 2, postline, readed, function(err) {
        redis.zinterstore(unread, 1, postline, function(err) {
            if(err) return callback(err);
            redis.zrevrange(unread, -1, -1, WITHSCORES, function(err, data) {
                redis.zadd(authorline, data[1] || 0, tofollow, callback);
            });
        });
      }
  });
};

exports.unfollow = function (user, unfouser, callback) {
  var following = user + _FOLLOWING
    , followers = unfouser + _FOLLOWERS
    , timeline = user + _TIMELINE
    , authorline = user + _AUTHORLINE
    , unread = user + _UNREAD_ + unfouser
    , readed = user + _READ_ + unfouser
    ;
  redis.zscore(user + _FOLLOWING, unfouser, function(err, score) {
      if(err) return callback(err);
      if(score != nil) {
        redis.multi()
        .zrem(following, unfouser)
        .zrem(followers, user)
        .del(unread)
        .del(readed)
        .zrem(authorline, unfouser)

        // TODO remove items when unfollow someone
        // .zdiffstore(user + _TIMELINE, user + _TIMELINE, unfouser + _TIMELINE)
        .incrRate(user, unfouser, - FOLLOW_RATE)
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

// **************************** dispath item *****************************

// K cluster -- key hash,
//
// Something like map reduce
// Z cluster -- value hash

// V hash, every cluster should do this
var SCRIPT_USER_DISPATCH_TIMELINE = [
  "local user, item, start, limit, time = KEYS[1], KEYS[2], KEYS[3], KEYS[4], tonumber(KEYS[5]);"
, "local followers = redis.call('zrange', user .. ':followers', start, start + limit);"
, "for i = 1, table.getn(followers) do"
, "  local follower = followers[i];"
  // FIXME the time as score could be duplicate
, "  redis.call('zadd', follower .. ':timeline', time, item);" // send to timeline
, "  redis.call('zadd', follower .. ':unread:' .. user, time, item);" // send to user-user unread line
  // trim to 1000 length
, "  redis.call('zremrangebyrank', follower .. ':timeline', 1000, -1)"
, "  redis.call('zremrangebyrank', follower .. ':unread:' .. user, 1000, -1)"

, "  local oldtime = tonumber(redis.call('zscore', follower .. ':authorline', user)) or 0"
, "  if(oldtime < time) then"
, "    redis.call('zadd', follower .. ':authorline', time, user)"
, "  end"
, "end"
, "return table.getn(followers)"
].join('\n');


exports.postItem = function(user, item, info, callback) {
  redis.lpush(user + _ITEMS, item, print);
  info.owner = user;
  var time = info.time = (info.time || now());
  redis.multi()
  .hmset(item, info)
  .zadd(user + _POSTLINE, time, item)
  .exec(callback);

  console.log(typeof time)

  clients.forEach(function(client){
      dispathTimeline(client, user, item, 0, 100, time)
  });
};

var dispathTimeline = function(client, user, item, start, limit, time) {
  client.eval(SCRIPT_USER_DISPATCH_TIMELINE, 5, user, item, start, limit, time, function(err, len) {
      if(err) {console.log(err && err.stack)}
      if(len >= limit) {
        // dispath next batch
        dispathTimeline(client, user, item, start + limit, limit, time);
      }
  });
}

exports.getTimeline = function (user, start, stop, callback) {
  redis.multi()
  .zcard(user + _TIMELINE)
  .zrevrange(user + _TIMELINE, start, stop)
  .exec(callback);
}

exports.getAuthorlineItem = function (user, start, stop, callback) {
  redis.zrevrange(user + _AUTHORLINE, start, stop, function(err, authors) {
      console.log(authors)
      async.map(authors, function(author, _callback) {
          redis.zrange(author + _POSTLINE, 0, 0, _callback);
      }, function(err, results) {
        if(err) return callback(err);
        callback(null, results.map(function(r) { return r[0] }));
    })
  });
}

// *************************** consumer timeline **************************

// read an item for a long time get high score
exports.readItem = function(user, item, timescore, callback) {
  if(timescore != 0) {
    rate.incrRate(user, item, timescore, print)
  }
  exports.markItemRead(user, item, callback);
};

exports.markItemRead = function(user, item, callback) {
  redis.hget(user, item, 'owner', function(err, owner) {
      if(err) return callback(err);
      redis.multi()
      // --- remove item from user-user unread line
      .zrem(user + _UNREAD_ + owner, item)
      // --- get next unread article time(score) from user-user-unread line
      .zrevrange(user + _UNREAD_ + owner, -1, -1, WITHSCORES)
      .exec(function(err, data) {
          if(err) return callback(err);
          var score = data[1] || 0;
          console.log('mark item read score is ');
          console.log(score);
          // ---- update author position by next unread article time
          redis.zadd(user + _AUTHORLINE, score, owner, callback);
      });

  });
  // ---- add to readed
  redis.zadd(user + _READ, item, print);
}

