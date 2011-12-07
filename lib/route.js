exports.route = function(app) {
  var posts = require('./posts');

  require('./users').route(app);
  require('./posts').route(app);
  require('./tags').route(app);
  require('./upload').route(app);
  require('./sync').route(app);

  /*
   * GET home page.
   */
  app.get('/', function(req, res, next) {
      if (!req.session.user) {
        res.render('index', {
            title: 'Posts'
        });
      } else {
        posts.posts(req, res, next);
      }
  });

};
