var config = require('../../config')
  , redis = config.redis
  , clients = [redis]
  , utils = require('./utils')
  , print = utils.print
  , now = Date.now
  ;

var _ITEMS          = ':items' // l
  , _POSTLINE       = ':postline'
  ;

// K cluster -- key hash,
//
// Something like map reduce
// Z cluster -- value hash

// V hash, every cluster should do this
var SCRIPT_USER_DISPATCH_TIMELINE = [
  "local user, item, start, limit, time = KEYS[1], KEYS[2], KEYS[3], KEYS[4], KEYS[5];"
, "local followers = redis.call('zrange', user .. ':followers', start, start + limit);"
, "for i = 1, table.getn(followers) do"
, "  local follower = followers[i];"
  // FIXME the time as score could be duplicate
, "  redis.call('zadd', follower .. ':timeline', time, item);"
  // trim to 1000 length
, "  redis.call('zremrangebyrank', follower .. ':timeline', 1000, -1)"
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

