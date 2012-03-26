var RedisPipe = require('./redis-pipe').RedisPipe;
var client = require('redis').createClient();

client.pipe()
.incr('testkey')
.incr('testkey')
.incr('testkey')
.del('testkey')
.exec(function(err, results) {
    console.log('result');
    console.log(results);
})
