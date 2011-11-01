module.exports = function(app){

  app.get('/tag', function(req, res){
      res.render('/tag', {
      });
  });

}
