module.exports = function(app){

  app.get('/posts', function(req, res){
      res.render('posts', {
          title: 'Posts'
      });
  });

}
