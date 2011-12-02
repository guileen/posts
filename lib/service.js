var db = require('./db')
  , robotskirt = require('robotskirt')
  // , redisClient = require('redis').createClient()
  , logger = require('nlogger').logger(module)
  , convert = require('validator').convert
  , Posts = db.collection('posts');

var mkdToHtml = function(mkd, callback) {
  robotskirt.toHtml(mkd, function(htmlBuffer){
      callback(htmlBuffer.toString());
  });
}

function parseData(data, callback) {

  switch(data.contentType){
  case 'markdown':
  default:
    mkdToHtml(data.content, callback)
  }

}

function loadUser(_id) {
  // load user from redis cache first
}

exports.loadPosts = function(userId, following, sinceId, limit, callback) {

  // var callback = arguments.pop()
  //   , userId = arguments.shift()
  //   , following = arguments.shift()
  //   , sinceId = arguments.shift()
  //   , limit = arguments.shift() || 30;

  var query = {};
  query['author._id'] = {$in : following ? following.map(db.toId) : [db.toId(userId)]};
  if(sinceId) {
    query._id = {$gt : sinceId};
  }
  db.posts.find(query).sort({ _id: -1}).limit(Math.max(limit, 50)).toArray(callback);

}

exports.createPost = function(user, data, callback) {
  data.author = {
    _id : db.toId(user._id)
  , name : user.name
  , avatar : user.avatar
  };
  data.createTime = new Date;
  parseData(data, function(html){
      data.html = convert(html).xss();
      Posts.save(data, callback);
  });
}

exports.updatePost = function(id, user, data, callback){
  Posts.update({_id:id})
}
