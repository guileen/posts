var RedisPipe = require('./redis-pipe').RedisPipe;
var client = require('redis').createClient();
var client2 = require('redis').createClient();
var client3 = require('redis').createClient();

client.pipe()
.incr('testkey')
.incr('testkey')
.del('testkey')
.sel(client2)
.incr('testkey2')
.incr('testkey2')
.del('testkey2')
.sel(client3)
.incr('testkey3')
.incr('testkey3')
.del('testkey3')
.exec(function(err, results) {
    console.log('result');
    console.log(results);
})
