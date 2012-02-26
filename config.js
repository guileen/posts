var config = module.exports = {
  uploadPath : '/Users/gl/var/upload'
, staticRoot : 'http://dev:8080/upload'
, db : require('mongoskin').db('mongodb://localhost/posts')
, redis : require('redis').createClient()
};

var logger = require('nlogger').logger(module);

var db = config.db;

db.bind('users');
db.bind('posts');
db.bind('system.js');

db.system.js.save({
    _id: 'counter'
  , value: function (name) {
      var ret = db.counters.findAndModify({query: {_id: name}, update: {$inc : {next: 1}}, "new": true, upsert: true});
      // ret == { "_id" : "users", "next" : 1 }
      return ret.next;
    }
}, function(err, reply) {
  // TODO shorten id, not work now
  logger.debug(reply);
});


db.users.ensureIndex({email: 1}, {unique: true}, function() {});

