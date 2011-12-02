var iform    = require('iform')
  , db       = require('./db')
  , convert  = require('validator').convert
  // , discount = require('discount')
  , robotskirt = require('robotskirt')
  , service = require('./service')
  , logger = require('nlogger').logger(module)
  ;

var robotskirtToHtml = function(src, callback){
  robotskirt.toHtml(src, function(html){
      callback(html.toString());
  })
}
var toHtml = function(src, callback) {
  callback(discount.parse(src));
}

var postForm = iform({
    _id : 'ObjectID'
  , content : {
      required: true
    }
});

exports.route = function(app){

  exports.posts = function(req, res, next) {
      var user = req.session.user;
      service.loadPosts(user._id, user.following, req.query.since, 30, function(err, items) {
          if(err) return next(err.stack ? err : new Error(err));
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
          if(err) return next(err.stack ? err : new Error(err));
          res.partial('posts/entry', items);
      });
  })

  app.post('/posts/new', postForm('content', 'tags'), function(req, res, next){
      if(req.iform.errors) {
        return res.json(req.iform.errors);
      }
      var data = req.iform.data;
      service.createPost(req.session.user, data, function(err, data){
          if(err) return next(err);
          logger.info(data);
          res.render('posts/entry', {
              entry: data
          });
      });
  });

}
