var config = require('./config')
  , FeedParser = require('feedparser')
  , service = require('./lib/service')
  , feedqueue = require('./lib/feedqueue')
  , db = config.db
  , MAX_RETRY = 0
  , RETRY_TIMEOUT = 5000
  , MAX_CONCURRENT = 10
  , CYCLE_TIME = 3600 * 2 // every 2 hours
  ;

var feeds_count = 0
  , done_count = 0
  , stop_parse = false
  , parallel = 0
  , next_sync_time = 0
  ;

function log(err) {
  if(err) {
    console.log(err.stack);
  }
}
/**
 * try to parse a feed for several times
 */
function tryParseFeed(feed, count) {

  /**
   * on one feed done
   */
  function doneFeed() {
    parallel --;
    if(++done_count >= feeds_count) {
      // one cycle has done
      console.log('cycle has done, sync later');
      done_count = 0;
      stop_parse = true;
      setTimeout(startParse, Date.now() - next_sync_time);
    }
    if(! stop_parse) {
      console.log('feed done: ' + feed);
      parseNextFeed();
    }
  }

  var parser = new FeedParser();
  parser.on('error', function(err) {
      console.log('error to parse feed: ' + feed);
      console.log(err.stack);
      if(count > 0){
        setTimeout(function(){
            tryParseFeed(feed, --count);
            console.log('retry feed: ' + feed + ' - ' + (MAX_RETRY - count));
        }, RETRY_TIMEOUT);
      } else {
        doneFeed();
      }
  });

  parser.on('meta', function(meta) {
      // console.log('meta of :' + feed);
      // console.log(meta);
      db.feeds.update({id: feed},  {
          $set: {
            title: meta.title
          , favicon: meta.favicon
          , description: meta.description
          , date: meta.date
          , pubDate: meta.pubDate
          , link: meta.link
          }
      }, log);
  });

  parser.on('article', function(article) {
      // console.log('article of :' + feed);
      // console.log(article);
      service.updateFeedPost(feed, article, log);
  });

  parser.on('end', doneFeed);
  // TODO how to handle request timeout error

  parser.parseUrl({
      url : feed
    , timeout : 5000
  });
}

function parseNextFeed() {
  parallel ++;
  feedqueue.popFeed(function(err, feed) {
      if(err) throw err;
      console.log('start parse:' + feed);
      console.log('parallel is ' + parallel);
      tryParseFeed(feed, MAX_RETRY);
  });
}

function startParse() {
  next_sync_time = Date.now() + CYCLE_TIME;
  feedqueue.feedsCount(function(err, len) {
      feeds_count = len;
      var l = Math.min(len, MAX_CONCURRENT)
      for(var i = 0; i < l; i++) {
        parseNextFeed();
      }
  });
}

process.on('uncaughtException', function(err) {
    console.log('uncaughtException');
    console.log(err.stack);
    console.log('parallel is ' + parallel);
    parseNextFeed();
})

startParse();
