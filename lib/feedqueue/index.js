var config = require('../../config')
  , rdb = config.redis
  , FEED_QUEUE = 'feed-queue'
  ;

exports.addFeedToQueue = function(user, feedurl, callback) {
  // TODO: how to make it fail safe
  // feeds is weight
  // feed-queue is task queue

  var script = "local feed, userId = KEYS[1], KEYS[2];\n\
    local index = redis.call('zrank', 'feeds', feed);\n\
    if(index ~= nil) then\n\
      redis.call('lpush', 'feed-queue', feed)\n\
    end\n\
    redis.call('zincrby', 'feeds', 1, feed);\n\
    return index;";

  rdb.eval(script, 2, feedurl, user.id, callback);
};

exports.feedsCount = function(callback) {
  rdb.llen(FEED_QUEUE, callback);
}

exports.popFeed = function(callback) {
  rdb.rpoplpush(FEED_QUEUE, FEED_QUEUE, callback);
}


