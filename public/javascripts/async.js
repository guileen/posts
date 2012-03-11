// (function() {
    var async = {};

    // if (typeof module !== 'undefined' && module.exports) {
    //   module.exports = async;
    // }
    // else {
    this.async = async;
    // }

    async.parallel = function (tasks, callback) {
      var results = [], maxIndex = tasks.length - 1;
      tasks.forEach(function(task, index) {
          task(function(err, data) {
              results[index] = data;
              if(err) callback(err);
              if(index === maxIndex) callback(null, results);
          });
      });
    }

    // async.waterfall = function (tasks, callback) {
    //   // TODO
    // }

// })();
