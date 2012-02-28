var config = require('./config')
  , FeedParser = require('feedparser')
  , db = config.db
  , redis = config.redis
  , RETRY_TIMES = 5
  , RETRY_TIMEOUT = 5000
  , MAX_CONCURRENT = 20
  , CYCLE_TIME = 3600 * 2 // every 2 hours
  ;

var feeds_count = 0
  , done_count = 0
  , stop_parse = false
  , parallel = 0
  , next_sync_time = 0
  ;
/**
 * on one feed done
 */
function doneFeed() {
  parallel --;
  if(++done_count >= feeds_count) {
    // one cycle has done
    done_count = 0;
    stop_parse = true;
    setTimeout(startParse, Date.now() - next_sync_time);
  }
  if(! stop_parse) {
    parseNextFeed();
  }
}

/**
 * try to parse a feed for several times
 */
function tryParseFeed(feed, count) {
  var parser = new FeedParser();
  parser.on('error', function(err) {
      if(count > 0){
        setTimeout(function(){
            tryParseFeed(feed, --count);
        }, RETRY_TIMEOUT);
      } else {
        doneFeed();
      }
  });

  parser.on('meta', function(meta) {
      service.update(feed, meta);
  });

  parser.on('article', function(article) {
      service.update(feed, article);
  });

  parser.on('end', doneFeed);
  // TODO how to handle request timeout error

  parser.parse(feed);
}

function parseNextFeed() {
  redis.rpoplpush('feed-queue', 'feed-queue', function(err, feed) {
      tryParseFeed(feed, RETRY_TIMES);
  });

  if(parallel < MAX_CONCURRENT) parseNextFeed();
}

function startParse() {
  next_sync_time = Date.now() + CYCLE_TIME;
  redis.llen('feed-queue', function(err, len) {
      feeds_count = len;
      parseNextFeed();
  });
}
