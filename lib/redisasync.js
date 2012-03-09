var async = require('async')
  , RedisClient = require('redis').RedisClient;

RedisClient.prototype.pipe = function() {
  return new Pipe(client);
}

function Pipe(client) {
  this.client = client;
}

for (var command in RedisClient) {
  Pipe.prototype[command] = function() {
    var self = this;
    this.parallel.push(function(cb) {
        var args = Array.prototype.slice.call(arguments);
        args.push(cb);
        RedisClient.prototype[command].apply(self.client, args)
    });
    return this;
  }
}

Pipe.prototype.exec = function(callback) {
  async.parallel(this.parallel, callback);
}
