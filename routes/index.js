module.exports = function(app){

  require('./users')(app);
  require('./posts')(app);
  require('./tags')(app);
  require('./upload')(app);

  /*
   * GET home page.
   */
  app.get('/', function(req, res){
      res.render('index', { title: 'Express' })
  });

}
