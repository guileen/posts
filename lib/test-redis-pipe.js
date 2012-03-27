var redispipe = require('./redis-pipe');
var client = require('redis').createClient();
var client2 = require('redis').createClient();
var client3 = require('redis').createClient();
var client4 = require('redis').createClient();

redispipe.bind('foo', function(arg, callback) {
    callback(null, 'foo:' + arg);
});

client.pipe()
.incr('testkey')
.incr('testkey')
.foo('bar')
.del('testkey')
.use(client2)
.incr('testkey2')
.incr('testkey2')
.foo('bar')
.del('testkey2')
.use(client3, client4)
.incr('testkey3')
.incr('testkey3')
.foo('bar')
.del('testkey3')
.use([client3, client4])
.incr('testkey3')
.incr('testkey3')
.foo('bar')
.del('testkey3')
.exec(function(err, results) {
    console.log('result');
    console.log(results);
})
