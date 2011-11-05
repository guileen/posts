exports.route = function(app){

  var crypto = require('crypto');
  var db = require('../db');
  var users = db.users;
  var validator = require('express-validator');

  function encryptPassword(password) {
    var md5, sha1;
    sha1 = crypto.createHmac('sha1', 'sha1 key');
    md5 = crypto.createHmac('md5', 'md5 key');
    sha1.update(password);
    md5.update(sha1.digest('hex'));
    return md5.digest('hex');
  };

  function authenticate(email, password, fn) {
    return users.findOne({
        email: email
      }, function(err, user) {
        if (!user) {
          return fn(new Error('Can not find user'));
        } else if (user.password === encryptPassword(password)) {
          return fn(null, user);
        } else {
          return fn(new Error('Wrong password'));
        }
    });
  };

  app.post('/signup', function(req, res) {
      req.body.email = req.body.email.trim();
      req.body.password = req.body.password.trim();
      users.findOne({email: req.body.email}, {email: 1}, function(err, user){
          if(err){
            return res.json({
                msg: 'error to validate user'
            });
          }
          if(user){
            return res.json({
                msg: 'Email exists'
            });
          }

          users.save({
              email: req.body.email,
              password: encryptPassword(req.body.password),
              createDate: new Date()
            }, function(err, user) {
              if (err) {
                res.json({
                    msg: err.stack
                });
              }
              req.session.regenerate(function() {
                  req.session.user = user;
                  res.json({
                      success: true
                  });
              });
          });

      });
  });

  app.post('/api/signin', function(req, res) {
      authenticate(req.body.email, req.body.password, function(err, user) {
          if (err) {
            res.json({
                sueccess: false
              , msg: err.message
            });
          } else if (user) {
            req.session.user = user;
            res.json({
                success: true
            });
          }
      });
  });

  app.post('/signin', function(req, res) {
      authenticate(req.body.email, req.body.password, function(err, user) {
          if (err) {
            res.render('users/signin', {
                fail: true,
                message: err.message,
                title: 'Sign in'
            });
          } else if (user) {
            req.session.user = user;
            res.redirect(req.query["continue"] || '/');
          } else {
            res.render('users/signin', {
                fail: true,
                message: 'email or password is incorrect',
                email: req.body.email,
                "continue": req.body["continue"] || '',
                title: 'Sign in'
            });
          }
      });
  });

  app.get('/user', function(req, res){
      res.render('users', {
          title: 'User'
      });
  });

  app.get('/signup', function(req, res){
      res.render('users/signup', {
          title: 'Sign up'
      });
  });

  app.get('/signin', function(req, res){
      res.render('users/signin', {
          title: 'Sign in'
      });
  });

  app.get('/signout', function(req, res) {
      return req.session.destroy(function() {
          return res.redirect('/');
      });
  });

  app.get('/preferences', function(req, res) {
      res.render('preferences', {
          title: 'Prefrences'
          , bodyClasses: 'preferences'
      });
  });

  app.post('/preferences', function(req, res) {
      console.dir(req.body);
      var fullname = req.body.fullname.trim()
        , email = req.session.user.email
        , avatar = req.body.avatar;

      users.findOne({fullname: fullname, email: {$ne: email}}, {fullname: 1}, function(err, user){
          if(err){
            res.json({
                msg: 'Can not verify fullname'
            });
            console.log(err);
          } else if(user){
            res.json({
                msg: 'Full name has been taken'
            });
          } else {
            users.update({email: email}, {$set: {fullname: fullname}}, function(err, reply){
                if(err){
                  res.json({
                      msg: 'Error update fullname'
                  });
                } else {
                  res.json({
                      success: true
                  });
                }
            });
          }
      });
  });

  app.get('/signup-step2', function(req, res) {
      res.render('preferences', {
          title: 'Set avatar'
          , setAvatar: true
      });
  });

}
