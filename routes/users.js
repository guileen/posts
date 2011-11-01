module.exports = function(app){

  app.get('/user', function(req, res){
      res.render('users', {
          title: 'User'
      });
  });

}
