exports.posts = function(req, res, next) {
  res.render('posts', {
      title: 'Posts'
  });
}

exports.route = function(app){

  app.get('/posts', exports.posts);

}
