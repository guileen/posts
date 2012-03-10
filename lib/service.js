var config = require('../config')
  , db = config.db
  , rdb = config.redis
  , robotskirt = require('robotskirt')
  , async = require('async')
  , logger = require('nlogger').logger(module)
  , convert = require('validator').convert
  , common = require('../common')
  , shorten = require('shorten')(rdb)
  , isModerator = common.isModerator
  , Users = db.collection('users')
  , Posts = db.collection('posts')
  , Feeds = db.collection('feeds')
  ;

db.bind('users');
db.bind('posts');
db.bind('feeds');
db.bind('system.js');

var logger = require('nlogger').logger(module);

db.users.ensureIndex({email: 1}, {unique: true}, function() {});
db.feeds.ensureIndex({id: 1}, {unique: true}, function() {});
db.posts.ensureIndex({guid: 1}, {unique: true}, function() {});

var code = function(name) {
  var ret = db.counters.findAndModify({query: {_id: name}, update: {$inc: {next: 1}}, 'new': true, upsert: true});
  // ret == { "_id" : "users", "next" : 1 }
  return ret.next;
}
code = code.toString();

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

exports.loadTimeline = function(userId, startIndex, len, callback) {
  rdb.zrevrange('user:' + userId, startIndex, startIndex + len, function(err, items) {
      console.log(items);
      var pids = items.map(function(item){ return item.substring(5 /* item: */) });
      loadPosts(pids, callback);
  });
}

exports.loadPosts = function(ids, callback) {
  var query = {
    _id: {$in: ids}
  , removeTime: null
  };

  Posts.find(query).toArray(callback);
}

exports.getPost = function(id, fields, callback) {
  var fieldsOpt;
  if (!callback) {
    callback = fields;
    fields = null;
  }
  if (!fields) {
    fieldsOpt = { revisions: { $slice: -1 }, comments: 0};
  } else {
    fieldsOpt = {};
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      fieldsOpt[field] = 1;
    }
  }
  db.posts.findOne({
      $or: [
        {_id: db.toObjectID(id)}
      , {slug: id}
      ]
  }, fieldsOpt, callback);
};

exports.createPost = function(user, data, callback) {
  var userId = db.toObjectID(user._id);
  data.authorId = userId;
  data.createTime = new Date;
  // participators data
  data.participators = {};
  data.participators[user._id] = {
    fullname   : user.fullname
  , md5        : user.md5
  , count      : 1
  , lastModify : new Date
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
      shorten.nextId('posts', function(err, id) {
          if (err) return callback(err);
          data.guid = 'http://posts.li/p/' + id;
          Posts.save(data, callback);
      });
  });
};

exports.updatePost = function(id, user, data, callback) {
  var userId = db.toObjectID(user._id);
  parseData(data, function(html) {
      // update {$set : setOpts}
      var setOpts = {
        html: html
      , lastModify: new Date
      };
      var prefix = 'participators.' + user._id + '.';
      setOpts[prefix + 'fullname'] = user.fullname;
      setOpts[prefix + 'md5'] = user.md5;
      setOpts[prefix + 'lastModify'] = new Date;
      if (data.title) setOpts.title = data.title;

      var incOpts = {};
      incOpts['participators.' + user._id + '.count'] = 1;

      Posts.update({_id: db.toObjectID(id)}, {
          $set: setOpts
        , $inc: incOpts
        , $push: {
            revisions: {
              contributor: userId
            , content: data.content
            , message: data.message
          }}
      }, {/* TODO what is safe?? */ safe: true}, callback);
  });
};

exports.removePost = function(id, user, callback) {
  var query = {_id: db.toObjectID(id)};
  if (!isModerator(user)) {
    query.authorId = db.toObjectID(user._id);
  }
  Posts.update(query, {$set: { removeTime: new Date }}, callback);
};

exports.addComment = function(id, user, content, callback) {
  mkdToHtml(content, function(html) {

      // TODO User can't send duplicate message in 30 seconds.
      // var sign = md5([user._id, content, new Date / 1000 / 30].join('&'));
      // TODO broadcast to

      var setOpts = {};
      setOpts['participators.' + user._id] = {
        fullname: user.fullname
      , md5: user.md5
      , lastModify: new Date
      };

      Posts.findAndModify({_id: db.toObjectID(id)}, [], {
          $inc: { commentsCount: 1 }
        , $set: setOpts
        , $push: {
            comments: {
              authorId: db.toObjectID(user._id)
            , authorMd5: user.md5
            , authorFullname: user.fullname
            , content: content
            , html: html
            }
          }
        }, {
          // return the updated post, old one if not specified
          new: true
          // return the last element(just append)
        , fields: {commentsCount: 1, comments: {$slice: -1}}
      }, callback);
  });
};

exports.loadComments = function(id, callback) {
  Posts.findOne({
      _id: db.toObjectID(id)
    },{
      fields: {
        commentsCount: 1
      , comments: {$slice: -10}
      }
  }, callback);
};

// TODO
// user hidden weighted label(a coder, a father, a forigen, a poor, a geek, a game player, a xxx game player)
// post hidden weighted label(a coder, a baby, a local, a finance, a toy, a puzzle, a xxx brand)
//
// a random label system.
// if a user has some fans, a post has many reader, mark it a unique label
// every new user mark as 'common-user', new post mark as 'common-post'

exports.userLike = function(id, user, callback) {
  // TODO train, to make the one has more weight, reduce previous weight by a percent by passed time.
  // weight(user) * score / weight(user) ** 2

  // FIXME big use of memory
  rdb.sadd('post-likers:' + id, user._id);
  rdb.sadd('user-like:' + user._id, id);
  rdb.incr('post-score:' + id + ':' + user._id);
};

exports.userFavorit = function(id, user, callback) {
  // Favorite is a very private settings
  // do we need a max?
  rdb.sadd('user-favorite:' + user._id, id);
  rdb.incr('post-score:' + id + ':' + user._id);
};

exports.addFeed = function(user, feedurl, callback) {
  // TODO: how to make it fail safe
  // feeds is weight
  // feed-queue is task queue

  var script = "local feed, userId = KEYS[1], KEYS[2];\n\
    local index = redis.call('zrank', 'feeds', feed);\n\
    if(index ~= nil) then\n\
      redis.call('lpush', 'feed-queue', feed)\n\
    end\n\
    redis.call('zincrby', 'feeds', 1, feed);\n\
    return index;";

  rdb.eval(script, 2, feedurl, user.id, callback);
};

exports.importFeeds = function(user, feeds, callback) {

  var tasks = feeds.map(function(item) {
      return function(_callback) {
        Feeds.insert(item, _callback);
      }
  });

  tasks = tasks.concat(feeds.map(function(item) {
        return function(_callback) {
          exports.addFeed(user, item.id, _callback);
        }
  }));

  tasks.push(function(_callback) {
      Users.update({ _id: db.toObjectID(user._id) }, {
          $addToSet: {
            feeds: {
              $each: feeds.map(function(item) {return item.id})
            }
          }
      }, _callback);
  });

  async.parallel(tasks, callback);

};

exports.updateFeedPost = function(feed, article, callback) {
  Posts.insert({
      isFeed     : true
    , feed       : feed
    , guid       : article.guid
    , link       : article.link
    , author     : article.author
    , title      : article.title
    , summary    : article.summary
    , html       : article.description
    , tags       : article.categories
    , lastModify : article.date || new Date
    , createTime : article.pubDate || new Date
  }, callback);
};
