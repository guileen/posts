var config = require('../config')
  , db = config.db
  , rdb = config.redis
  , robotskirt = require('robotskirt')
  , async = require('async')
  , logger = require('nlogger').logger(module)
  , convert = require('validator').convert
  , shorten = require('shorten')(rdb)
  , Users = db.collection('users')
  , Posts = db.collection('posts')
  , Feeds = db.collection('feeds')
  , common = require('../common')
  , feedqueue = require('./feedqueue')
  , social = require('./social')
  , msgqueue  = require('./msgqueue')
  ;

db.bind('users');
db.bind('posts');
db.bind('feeds');
db.bind('system.js');

var logger = require('nlogger').logger(module);

function print(err) { if(err) logger.error(err.message) };

db.users.ensureIndex({email: 1}, {unique: true}, function() {});
db.feeds.ensureIndex({key: 1}, {unique: true}, function() {});
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
  var userKey = 'user:' + userId;
  msgqueue.loadTimeline(userKey, startIndex, startIndex + len, function(err, postKeys) {
      if(err) return callback(err);

      async.parallel([
          function(_callback) {
            exports.loadPostsByKeys(postKeys, _callback);
          }
        , function(_callback) {
            async.map(postKeys, function(postKey, _callback) {
                social.itemCommunityInfo(userKey, postKey, _callback)
            }, _callback);
          }
      ], function(err, results) {
        if(err) return callback(err);
        var posts = results[0]
          , comInfo = results[1]
          ;
        var postsMap = {};
        // sort posts by key
        posts.forEach(function(post) {
            postsMap[post.key] = post;
        });
        posts = postKeys.map(function(postKey, index) {
            var post = postsMap[postKey];
            if(post) post.comInfo = comInfo[index];
            return post;
        });
        callback(err, posts);
    })
  });
}

exports.loadPostsByKeys = function(keys, callback) {
  var query = {
    key: {$in: keys}
  , removeTime: null
  };

  Posts.find(query).toArray(callback);
}

exports.loadUsers = function(uids, callback) {
  uids = uids.map(function(uid) {return db.toObjectID(uids)});
  Users.find({_id : {$in : uids}}, {md5: 1, fullname: 1}).toArray(function(err, users) {
      if(err) return callback(err);
      callback(null, users);
  });
}

exports.loadFeeds = function(fids, callback) {
  Feeds.find({key : {$in : fids}}, {id: 1, favicon: 1, title: 1}).toArray(function(err, users) {
      if(err) return callback(err);
      callback(null, users);
  });
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
          data.key = 'post:' + common.md5(data.guid);
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
  if (!common.isModerator(user)) {
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

exports.followFeeds = function(user, feeds, callback) {

  // insert feeds in mongodb
  var tasks = feeds.map(function(feed) {
      return function(_callback) {
        Feeds.insert(feed, _callback);
      }
  });

  // add feed to queue
  tasks = tasks.concat(feeds.map(function(feed) {
        return function(_callback) {
          feedqueue.addFeedToQueue(user, feed.url, _callback);
        }
  }));

  // user follow feeds
  feeds.forEach(function(feed) {
      social.follow('user:' + user._id, 'feed:' + feed.key);
  });

  tasks.push(function(_callback) {
      Users.update({ _id: db.toObjectID(user._id) }, {
          $addToSet: {
            feeds: {
              $each: feeds.map(function(feed) {return feed.id})
            }
          }
      }, _callback);
  });

  async.parallel(tasks, callback);

};

exports.updateFeedPost = function(feedkey, article, callback) {
  var post = {
        isFeed     : true
      , feedkey    : feedkey
      , guid       : article.guid
      , key        : 'post:' + common.md5(article.guid)
      , link       : article.link
      , author     : article.author
      , title      : article.title
      , summary    : article.summary
      , html       : article.description
      , tags       : article.categories
      , lastModify : article.date || new Date
      , createTime : article.pubDate || new Date
      }
  Posts.findAndModify({ // query
      guid : article.guid
    }, [/* sort */], { // update
      $set : post
    }, { upsert: true, fields: { _id: 1} }, function(err, doc) {
      if(err) return callback(err);
      callback(err, doc);
      social.postItem(feedkey, post.key, {}, function(err, data) {
          if(err) logger.error(err);
          else logger.info(data);
      });
  });
};
