var fs          = require('fs')
  , querystring = require('querystring')
  , path        = require('path')
  , formidable  = require('formidable')
  , mime        = require('mime')
  , config    = require('../config')
  , uploadPath  = path.normalize(config.uploadPath)
  , staticRoot  = config.staticRoot;
  

fs.mkdir(uploadPath, '777');

exports.route = function(app) {

  // TODO permission and file size, remeber uploader, md5 check, client side md5 check
  app.post('/upload', function(req, res, next) {
      console.dir(req.query);
      var form = new formidable.IncomingForm();
      form.parse(req, function(err, fields, files) {
          var file = files.file;
          fs.rename(file.path, uploadPath + '/' + file.name);
          res.json({
              success : true
            , filename : file.name
            , mime : mime.lookup(file.name)
            , url : staticRoot + '/' + file.name
          });
      });
  });

  app.get('/upload', function(req, res, next) {
      res.writeHead(200, {'content-type': 'text/html'});
      res.end(
        '<form action="/upload" enctype="multipart/form-data" method="post">' +
        '<input type="text" name="title"><br>' +
        '<input type="file" name="upload" multiple="multiple"><br>' +
        '<input type="submit" value="Upload">' +
        '<a href="#" onclick="document.forms[0].submit()">submit</a>' + 
        '</form>'
      );
  });
};
