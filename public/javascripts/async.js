// This is an lite version of `async`, see https://github.com/caolan/async
//
// es5shim.js is required for old version browsers
//
// Author: Gui Lin
// Email: guileen@gmail.com


var async = {};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = async;
}

// example:
//
// async.parallel([
//     function(_callback) {
//       loadUser(uid, _callback);
//     }
//   , function(_callback) {
//       loadBook(bookId, _callback);
//     }
//   ], function(err, results) {
//     var user = results[0]
//       , book = results[1]
//       ;
//     console.log(user);
//     console.log(book);
// })

async.parallel = function (tasks, callback) {
  var results = [], count = tasks.length;
  tasks.forEach(function(task, index) {
      task(function(err, data) {
          results[index] = data;
          if(err) {
            callback(err);
            callback = null;
          }
          if(--count === 0 && callback) {
            callback(null, results);
          }
      });
  });
}
