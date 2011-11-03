module.exports = function(app) {
  app.post('/upload', function(req, res, next){
      res.send({success: true});
  });
}
