var async = require('async')
  , RedisClient = require('redis').RedisClient;

RedisClient.prototype.pipe = function() {
  return new RedisPipe(this);
}

function RedisPipe(client) {
  this.client = client;
  this._queue = [];
}

exports.bind = function (command, method) {
  RedisPipe.prototype[command] = function() {
    var self = this;
    var args = Array.prototype.slice.call(arguments);
    this._queue.push(function(cb) {
        args.push(cb);
        method.apply(self.client, args)
    });
    return this;
  }
}

for (var command in RedisClient.prototype) {
  exports.bind(command, RedisClient.prototype[command]);
}

RedisPipe.prototype.exec = function(callback) {
  async.parallel(this._queue, callback);
}

exports.RedisPipe = RedisPipe;
