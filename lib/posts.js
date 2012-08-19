var iform    = require('iform')
  , config   = require('../config')
  , db       = config.db
  , convert  = require('validator').convert
  , service = require('./service')
  , social = require('./social')
  , logger = require('cclog')

var postForm = iform({
    _id : 'ObjectID'
  , content : {
      required: true
    }
});

var commentForm = iform({
    number : 'int'
  , content : {
      required: true
    }
});

exports.route = function(app) {

  exports.posts = function(req, res, next) {
      var user = req.session.user;
      res.render('posts', {
          title: 'Posts'
        , posts: []
      });
  }

  app.get('/posts', exports.posts);

  app.post('/posts/new', postForm('content', 'title', 'slug'), function(req, res, next) {
      if (req.iform.errors) {
        return res.json(req.iform.errors);
      }
      var data = req.iform.data;
      logger.info('posting', data)
      service.createPost(req.session.user, data, function(err, data) {
          if (err) logger.trace(err);
          if (err) return next(err);
          logger.info(data);
          res.render('posts/entry', {
              entry: data
          });
      });
  });

  app.get('/api/post/timeline/:start/:len', function(req, res, next) {
      var len = Math.min(req.params.len || 10, 50);
      service.loadTimeline(req.session.user._id, req.params.start, len, function(err, data) {
          if(err) {return next(err);}
          res.json(data);
      });
  });

  app.get('/api/post/authorline/:start/:len', function(req, res, next) {
      var len = Math.min(req.params.len || 10, 50)
        , userkey = 'user:' + req.session.user._id;
      social.getAuthorlineItem(userkey, req.params.start, len, function(err, keys) {
          console.log(keys);
          service.loadFullPostsByKeys(userkey, keys, function(err, data) {
              if(err) {return next(err);}
              res.json(data);
          })
      })
  });

  app.get('/api/users/posts', function(req, res, next) {
      var users = req.query.users
        , perlen = req.query.perlen
        ;
  })

  app.get('/api/post/rateline/:start', function(req, res, next) {

  });

  app.get('/api/post/:id', function(req, res, next) {
      var fields = req.query.fields;
      fields = fields && fields.split(',');
      service.getPost(req.params.id, fields, function(err, data) {
          if (err) {return next(err);}
          res.json(data);
      });
  })

  app.get('/post/:id/modify', function(req, res, next) {
      service.getPost(req.params.id, function(err, data) {
          if (err) {return next(err);}
          res.render('posts/modify', {
              entry: data
            , title: 'Modify'
          });
      });
  });

  app.post('/api/post/:id/modify', postForm('title', 'content', 'message'),  function(req, res, next) {
      if (req.iform.errors) {
        return res.json(req.iform.errors);
      }
      var data = req.iform.data;
      logger.info(data);
      service.updatePost(req.params.id, req.session.user, data, function(err, data) {
          logger.info(err);
          logger.info(data);
          if (err) return next(err);
          res.json(data);
      });
  });

  app.post('/api/post/:id/remove', function(req, res, next) {
      service.removePost(req.params.id, req.session.user, function(err, data) {
          if (err) {return res.json({error: true, message: 'fail to remove post' })}
          res.json({success: true});
      });
  });

  app.get('/api/post/:id/comments', function(req, res, next) {
      service.loadComments(req.params.id, function(err, data) {
          if (err) {return next(err);}
          var comments = data.comments;
          if(req.query.start > (data.commentsCount - comments.length)){
            comments = comments.slice(req.query.start);
          }
          res.json({
              commentsCount : data.commentsCount
            , comments : data.comments
          });
      });
  });

  app.post('/api/post/:id/comments/new', function(req, res, next) {
      var content = req.body['content'];
      service.addComment(req.params.id, req.session.user, content, function(err, data) {
          if (err) {return next(err);}
          res.json({
              commentCount : data.commentsCount
            , comments: data.comments
          });
      });
  });

  app.post('/api/like/:key/:value', function(req, res, next) {
      var method;
      if(req.params.value == '1') {
        method = 'likeItem'
      } else if(req.params.value == '0') {
        method = 'undoLikeItem'
      } else {
        return res.send('invalid request', 403);
      }
      social[method](req.session.userkey, req.params.key, function(err, data) {
          if(err) {return next(err);}
          res.json(data);
      });
  });

  app.get('/api/user/mget', function(req, res, next) {
      var uids = req.query.users;
      if(uids.length > 255) {
        res.send('bad request, too long', 403);
      }
      service.loadUsers(uids, function(err, results) {
          if(err) return next(err);
          res.json(results);
      });
  });

  app.get('/api/feed/mget', function(req, res, next) {
      var fids = req.query.feeds;
      if(fids.length > 255) {
        res.send('bad request, too long', 403);
      }
      service.loadFeeds(fids, function(err, results) {
          if(err) return next(err);
          res.json(results);
      });
  });

};
