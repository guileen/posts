var async = require('async')
  , RedisClient = require('redis').RedisClient;

RedisClient.prototype.pipe = function() {
  return new RedisPipe(this);
}

function RedisPipe(client, queue) {
  this.client = client;
  this._queue = queue || [];
}

exports.bind = function (command, method) {
  RedisPipe.prototype[command] = function() {
    var client = this.client
      , queue = this._queue
      , args = Array.prototype.slice.call(arguments);

    if(Array.isArray(client)) {
      var len = args.length;
      queue.push(function(cb) {
          var tasks = client.map(function(cli) {
              return function(_cb) {
                args[len] = _cb;
                method.apply(cli, args);
              }
          });
          async.parallel(tasks, cb);
      });
    } else {
      queue.push(function(cb) {
          args.push(cb);
          method.apply(client, args)
      });
    }
    return this;
  }
}

RedisPipe.prototype.use = function (client) {
  if(arguments.length > 1) {
    client = Array.prototype.slice.call(arguments);
  }
  return new RedisPipe(client, this._queue);
}

for (var command in RedisClient.prototype) {
  exports.bind(command, RedisClient.prototype[command]);
}

RedisPipe.prototype.exec = function(callback) {
  async.parallel(this._queue, callback);
}

exports.RedisPipe = RedisPipe;
