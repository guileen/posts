var db = require('./db')
  , robotskirt = require('robotskirt')
  // , redisClient = require('redis').createClient()
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

exports.createPost = function(user, data, callback) {
  data.author = {
    _id : db.toId(user._id)
  , name : user.name
  , avatar : user.avatar
  };
  data.createTime = new Date;
  parseData(data, function(html){
      data.html = html;
      Posts.save(data, callback);
  });
}

exports.updatePost = function(id, user, data, callback){
  Posts.update({_id:id})
}
