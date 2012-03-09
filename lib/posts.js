var iform    = require('iform')
  , config   = require('../config')
  , db       = config.db
  , convert  = require('validator').convert
  , service = require('./service')
  , community = require('./recsys/community')
  , logger = require('nlogger').logger(module);

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
      service.loadPosts(user._id, user.following, req.query.since, 30, function(err, items) {
          if (err) return next(err.stack ? err : new Error(err));
          res.render('posts', {
              title: 'Posts'
            , posts: items
          });
      });
  }

  app.get('/posts', exports.posts);

  app.get('/posts/list', function(req, res, next) {
      var user = req.session.user;
      service.loadPosts(user._id, user.following, req.query.since, 30, function(err, items) {
          if (err) return next(err.stack ? err : new Error(err));
          res.partial('posts/entry', items);
      });
  });

  app.post('/posts/new', postForm('content', 'title', 'slug'), function(req, res, next) {
      if (req.iform.errors) {
        return res.json(req.iform.errors);
      }
      var data = req.iform.data;
      service.createPost(req.session.user, data, function(err, data) {
          if (err) return next(err);
          logger.info(data);
          res.render('posts/entry', {
              entry: data
          });
      });
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

  app.post('/post/:id/modify', postForm('title', 'content', 'message'),  function(req, res, next) {
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

  app.post('/post/:id/remove', function(req, res, next) {
      service.removePost(req.params.id, req.session.user, function(err, data) {
          if (err) {return res.json({error: true, message: 'fail to remove post' })}
          res.json({success: true});
      });
  });

  app.get('/post/:id/comments', function(req, res, next) {
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

  app.post('/post/:id/comments/new', function(req, res, next) {
      var content = req.body['content'];
      service.addComment(req.params.id, req.session.user, content, function(err, data) {
          if (err) {return next(err);}
          res.json({
              commentCount : data.commentsCount
            , comments: data.comments
          });
      });
  });

  app.post('/post/:id/like', function(req, res, next) {
      community.likeItem(req.session.userkey, 'post:' + req.params.id, function(err, data) {
          if(err) {return next(err);}
          res.send();
      })
  })

};
