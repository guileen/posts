var db = require('./db')
  , robotskirt = require('robotskirt')
  // , redisClient = require('redis').createClient()
  , logger = require('nlogger').logger(module)
  , convert = require('validator').convert
  , common = require('../common')
  , isModerator = common.isModerator
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

  var query = {
    authorId : {$in : following ? following.map(db.toObjectID) : [db.toObjectID(userId)]}
  };
  if(sinceId) {
    query._id = {$gt : sinceId};
  }
  db.posts.find(query, { revisions: { $slice : -1 }}).sort({ _id: -1}).limit(Math.max(limit, 50)).toArray(callback);

}

exports.getPost = function(id, callback) {
  db.posts.findOne({
      $or:[
        {_id : db.toObjectID(id)}
      , {slug : id}
      ]
  }, { revisions: { $slice: -1 }}, callback);
}

exports.createPost = function(user, data, callback) {
  var userId = db.toObjectID(user._id);
  data.authorId = userId;
  data.createTime = new Date;
  // contributors data
  data.contributors = {};
  data.contributors[user._id] = {
    fullname   : user.fullname
  , md5        : user.md5
  , count      : 1
  , lastUpdate : new Date
  }
  // centralized version controle system
  // revisions data
  data.revisions = [{
      contributor : userId
    , content     : data.content
    , message     : '1st commit'
  }];

  parseData(data, function(html){
      delete data.content;
      data.html = convert(html).xss();
      Posts.save(data, callback);
  });
}

exports.updatePost = function(id, user, data, callback){
  var userId = db.toObjectID(user._id);
  parseData(data, function(html){
      // update {$set : setOpts}
      var setOpts = { html : html };
      var prefix = "contributors." + user._id + ".";
      setOpts[prefix + "fullname"] = user.fullname;
      setOpts[prefix + "md5"] = user.md5;
      setOpts[prefix + "lastUpdate"] = new Date;
      if(data.title) setOpts.title = data.title;

      var incOpts = {};
      incOpts["contributors." + user._id + ".count"] = 1;

      Posts.update({_id: db.toObjectID(id)}, {
          $set : setOpts
        , $inc : incOpts
        , $push : {revisions: {
              contributor : userId
            , content : data.content
            , message : data.message
          }}
      }, {/* TODO what is safe?? */ safe: true}, callback);
  });
}

exports.removePost = function(id, user, callback) {
  var query = {_id : db.toObjectID(id)};
  if(!isModerator(user)) {
    query.authorId = db.toObjectID(user._id);
  }
  Posts.remove(query, callback);
}
