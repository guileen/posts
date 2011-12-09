var db = require('./db')
  , robotskirt = require('robotskirt')
  // , redisClient = require('redis').createClient()
  , logger = require('nlogger').logger(module)
  , convert = require('validator').convert
  , common = require('../common')
  , isModerator = common.isModerator
  , Posts = db.collection('posts');

var mkdToHtml = function(mkd, callback) {
  robotskirt.toHtml(mkd, function(htmlBuffer) {
      callback(htmlBuffer.toString());
  });
};

function parseData(data, callback) {

  switch (data.contentType) {
  case 'markdown':
  default:
    mkdToHtml(data.content, callback);
  }

}

function loadUser(_id) {
  // load user from redis cache first
}

exports.loadPosts = function(userId, following, sinceId, limit, callback) {

  var query = {
    authorId : {$in : following ? following.map(db.toObjectID) : [db.toObjectID(userId)]}
  , removeTime : null
  };
  if (sinceId) {
    query._id = {$gt : sinceId};
  }
  db.posts.find(query, {
      revisions: { $slice : -1 }
    , comments: 0
  }).sort({ _id: -1}).limit(Math.max(limit, 50)).toArray(callback);

};

exports.getPost = function(id, callback) {
  db.posts.findOne({
      $or: [
        {_id : db.toObjectID(id)}
      , {slug : id}
      ]
  }, { revisions: { $slice: -1 }, comments: 0}, callback);
};

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
  };
  // centralized version controle system
  // revisions data
  data.revisions = [{
      contributor : userId
    , content     : data.content
    , message     : '1st commit'
  }];

  data.comments = [];

  parseData(data, function(html) {
      delete data.content;
      data.html = convert(html).xss();
      Posts.save(data, callback);
  });
};

exports.updatePost = function(id, user, data, callback) {
  var userId = db.toObjectID(user._id);
  parseData(data, function(html) {
      // update {$set : setOpts}
      var setOpts = { html : html };
      var prefix = "contributors." + user._id + ".";
      setOpts[prefix + "fullname"] = user.fullname;
      setOpts[prefix + "md5"] = user.md5;
      setOpts[prefix + "lastUpdate"] = new Date;
      if (data.title) setOpts.title = data.title;

      var incOpts = {};
      incOpts["contributors." + user._id + ".count"] = 1;

      Posts.update({_id: db.toObjectID(id)}, {
          $set : setOpts
        , $inc : incOpts
        , $push : {
            revisions: {
              contributor : userId
            , content : data.content
            , message : data.message
          }}
      }, {/* TODO what is safe?? */ safe: true}, callback);
  });
};

exports.removePost = function(id, user, callback) {
  var query = {_id : db.toObjectID(id)};
  if (!isModerator(user)) {
    query.authorId = db.toObjectID(user._id);
  }
  Posts.update(query, {$set: { removeTime : new Date }}, callback);
};

exports.addComment = function(id, user, content, callback) {
  mkdToHtml(content, function(html) {

      // TODO User can't send duplicate message in 30 seconds.
      // var sign = md5([user._id, content, new Date / 1000 / 30].join('&'));
      // TODO broadcast to

      Posts.findAndModify({_id: db.toObjectID(id)}, [], {
          $inc: { commentsCount : 1 }
        , $push: {
            comments: {
              authorId : db.toObjectID(user._id)
            , authorMd5 : user.md5
            , authorFullname : user.fullname
            , content : content
            , html : html
            }
          }
        }, {
          // return the updated Post, old one if not specified
          new: true
          // return the last element(just append)
        , fields : {commentsCount: 1, comments: {$slice: -1}}
        }, callback);
  });
};

exports.loadComments = function(id, callback) {
  Posts.findOne({
      _id:db.toObjectID(id)
    },{
      fields: {
        commentsCount : 1
      , comments: {$slice: -10}
      }
  }, callback);
};
