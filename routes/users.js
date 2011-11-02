module.exports = function(app){

  app.get('/user', function(req, res){
      res.render('users', {
          title: 'User'
      });
  });

  app.get('/signup', function(req, res){
      res.render('users/signup', {
          title: 'Sign up',
      });
  });

  app.get('/signin', function(req, res){
      res.render('users/signin', {
          title: 'Sign in',
      });
  });

}
