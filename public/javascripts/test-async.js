var async = require('./async');

async.parallel([
    function(_callback) {
      _callback(null, 'a');
    }
  , function(_callback) {
      _callback(null, 'b');
    }
], function(err, results) {
  console.log('test1');
  console.log(err);
  console.log(results);
})


async.parallel([
    function(_callback) {
      _callback('err');
    }
  , function(_callback) {
      _callback(null, 'b');
    }
], function(err, results) {
  console.log('test2');
  console.log(err);
  console.log(results);
})
