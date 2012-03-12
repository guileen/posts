var async = require('./async');

async.parallel([
    function(_callback) {
      setTimeout(function() {
          _callback(null, 'a');
      }, 200)
    }
  , function(_callback) {
      setTimeout(function() {
          _callback(null, 'b');
      }, 100)
    }
], function(err, results) {
  console.log('test1');
  console.log(err);
  console.log(results);
})


async.parallel([
    function(_callback) {
      setTimeout(function() {
          _callback('err');
      }, 200)
    }
  , function(_callback) {
      setTimeout(function() {
          _callback(null, 'a');
      }, 100)
    }
], function(err, results) {
  console.log('test2');
  console.log(err);
  console.log(results);
})
