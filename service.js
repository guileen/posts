var db = require('db')
  , robotskirt = require('robotskirt')
  , Posts = db.collection('posts');

var mkdToHtml = robotskirt.toHtml;

function parseData(data, callback) {

  switch(data.contentType){
  case 'markdown':
  default:
    mkdToHtml(data.content, callback)
  }

}

exports.createPost = function(user, data, callback) {
  data.author = {
    _id : user._id
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
