var config    = require('../../config')
  , redis     = config.redis
  , _POSTLINE = ':postline'
  , _TIMELINE = ':timeline'
  , _RATELINE = ':rateline'
  ;

exports.loadTimeline = function(userkey, start, len, callback) {
  len = Math.min(len, 1000);
  redis.zrange(userkey + _TIMELINE, start, len, callback);
}

exports.loadRateline = function(userkey, start, len, callback) {
  len = Math.min(len, 1000);
  redis.zrange(userkey + _RATELINE, start, len, callback);
}

exports.pushRateline = function(userkey, itemkey, callback) {

}

exports.pushTimeline = function(userkey, itemkey, callback) {

}
