var config = require('./config')
  , db = config.db
  , redis = config.redis
  , MAX_CONCURRENT = 20
  ;

currentKey = 'queue' + cycle;
nextKey = 'queue' + cycle;

redis.rpush(nextKey, done_feed);

if(parallel < MAX_CONCURRENT) {
  redis.lpop(currentKey)
  parseFeed();
}

// all done
redis.inc(cycle);

