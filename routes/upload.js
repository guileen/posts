var fs = require('fs')
  , querystring = require('querystring')
  , path = require('path')
  , uploadDir = path.normalize(__dirname + '/../public/upload/');

fs.mkdir(uploadDir, '777');

exports.route = function(app) {

  app.post('/upload', function(req, res, next){
      console.dir(req.query);
      req.pipe(fs.createWriteStream(uploadDir + req.session.user.md5 + '-' + req.query.qqfile));
      req.on('end', function(){
          res.json({success: true});
      });
  });
}
