var iform    = require('iform')
  , db       = require('./db')
  , convert  = require('validator').convert
  // , discount = require('discount')
  , robotskirt = require('robotskirt')
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
    res.render('posts', {
        title: 'Posts'
    });
  }

  app.get('/posts', exports.posts);

  app.post('/posts/new', postForm('content', 'tags'), function(req, res, next){
      if(req.iform.errors) {
        return res.json(req.iform.errors);
      }
      var data = req.iform.data;
      robotskirt.toHtml(data.content, function(html){
          data.html = html.toString();
          db.posts.insert(data, function(err, data){
              if(err) return next(err);
              console.dir(data);
              res.render('posts/entry', data[0]);
          });
      })
  });

}
