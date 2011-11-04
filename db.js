var mongoskin = require('mongoskin');

var db = module.exports = mongoskin.db('mongo://localhost/posts');

db.bind('users');

db.users.ensureIndex({email: 1}, {unique: true}, function(){});

