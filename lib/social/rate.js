var config = require('../../config')
  , redispipe = require('../redis-pipe')
  , redis = config.redis
  , shorten = require('shorten')(redis)
  , async = require('async')
  , logger = require('nlogger').logger(module)
  , utils = require('./utils')
  , print = utils.print
  , now = Date.now
  ;

var _LIKE           = ':like' // s
  , _DISLIKE        = ':dislike' // s
  , _RATE_USERS     = ':rateusers' // z
  , _RATE_ITEMS     = ':rateitems' // z
  , _RATERS         = ':raters'
  , LIKE_SCORE      = 1
  , DISLIKE_SCORE   = -4
  ;

var _SCRIPT_ITEM_AVGRATE = [
  'local user, item, score = KEYS[1], KEYS[2], KEYS[3];'
, "local ratesum = redis.call('hincrby', item, 'ratesum', score)"
, "local ratecount;"
, "if(rate == score) then"
, "  ratecount = redis.call('hincrby', item, 'ratecount', 1);"
, "else"
, "  ratecount = redis.call('hget', item, 'ratecount')"
, "end"
, "local avgrate = ratesum / ratecount"
, "redis.call('hset', item, 'avgrate', avgrate)"
, 'return rate, avgrate;'
].join('\n');

redispipe.bind({
    incrRate: function(user, item, score, callback) {
      var self = this;

      this.pipe()
      .hincrby(item, 'ratesum', score)
      // TODO multi
      .zincrby(item + _RATERS, score, user)
      .zcard(item + _RATERS)
      .exec(function(err, results) {
          var ratesum = results[0]
            , ratecount = results[2]
            ;
          var avgrate = ratesum / ratecount;
          self.hset(item, 'avgrate', avgrate, callback)
      });
    }

  , incrItemRate: function(user, item, score, callback) {
      // redis.eval(_SCRIPT_INCR_ITEM_RATE, 3, user, item, score, callback)
      var self = this;
      this.hget(item, 'owner', function(err, owner) {
          self.pipe()
          // TODO refactor this
          .incrRate(user, item, score)
          .incrRate(user, owner, score)
          .exec(callback);

      });
    }
});


function moveItemFromTo(user, item, _from, _to, from_score, to_score, callback) {
  redis.sismember(user + _to, item, function(err, is_to) {
      if(is_to === 0) {
        // is not member of _to
        redis.sismember(user + _from, item, function(err, is_from) {
            var score = to_score;
            var pipe = redis.pipe();
            if(is_from === 1) {
              score -= from_score;
              pipe.srem(user + _from, item);
            }
            pipe 
            .sadd(user + _to, item)
            .incrItemRate(user, item, score)
            .exec(callback);
        });
      } else {
        callback(new Error('item ' + item + ' already in : ' + user + _to));
      }
  });
}

function removeItemFrom(user, item, _group, group_score, callback) {
  redis.sismember(user + _group, item, function(err, ismember) {
      if(ismember === 1) {
        redis.pipe()
        .srem(user + _group, item)
        .incrItemRate(user, item, - group_score)
        .exec(callback);
      } else {
        callback(new Error('data not found'));
      }
  });
}

exports.likeItem = function(user, item, callback) {
  moveItemFromTo(user, item, _DISLIKE, _LIKE, DISLIKE_SCORE, LIKE_SCORE, callback);
}

exports.undoLikeItem = function(user, item, callback) {
  removeItemFrom(user, item, _LIKE, LIKE_SCORE, callback);
}

exports.dislikeItem = function(user, item, callback) {
  moveItemFromTo(user, item, _LIKE, _DISLIKE, LIKE_SCORE, DISLIKE_SCORE, callback);
};

exports.undoDislikeItem = function(user, item, callback) {
  removeItemFrom(user, item, _DISLIKE, DISLIKE_SCORE, callback);
}

exports.rateInfo = function(user, item, callback) {
  redis.pipe()
  .sismember(user + _LIKE, item)
  .sismember(user + _DISLIKE, item)
  .zscore(user + _RATE_ITEMS, item)
  .exec(function(err, results) {
      if(err) return callback(err);
      callback(err, {
          isLike : results[0]
        , disLike : results[1]
        , score : results[3]
      });
  });
}
