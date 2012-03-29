var config = require('../../config')
  , redis = config.redis
  , clients = [redis]
  , utils = require('./utils')
  , async = require('async')
  , print = utils.print
  , now = Date.now
  ;

var _ITEMS          = ':items' // l
  , _POSTLINE       = ':postline'
  , _TIMELINE       = ':timeline'
  , _AUTHORLINE    = ':authorline'
  ;

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
, "  redis.call('zadd', follower .. ':timeline', time, item);"
  // trim to 1000 length
, "  redis.call('zremrangebyrank', follower .. ':timeline', 1000, -1)"

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

exports.getAuthorline = function (user, start, stop, callback) {
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
