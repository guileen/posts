module.exports = function(app){

  app.get('/tag', function(req, res){
      res.render('tags', {
          title: 'Tags'
      });
  });

}
