
/**
 * Module dependencies.
 */

var express = require('express');
var settings = require('./settings');
var RedisStore = require('connect-redis')(express);

var app = module.exports = express.createServer();

var development = app.settings.env == 'development';

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {pretty: development, layout: false});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "keyboard cat", store: new RedisStore }));
  app.use(require('connect-less')({ src: __dirname + '/public/', compress: !development }));
  app.use(express.favicon(__dirname + '/public/favicon.ico'))
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

  for(var name in settings) {
    app.set(name, settings[name]);
  }
});

app.configure('development', function(){
  // app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  // app.use(express.errorHandler()); 
});

app.use(function(err, req, res, next) {
    if(err == 404){
      res.render('404');
    } else if(err == 500) {
      res.render('500');
    } else if(err instanceof Error) {
      // log req.body, req.query, req.cookie, req.user, and error 
      res.render('500');
      console.log(err.stack);
    } else {
      res.render('500');
      console.log(err);
    }
});

app.get('/404', function(req, res, next) {
    next(404);
});

app.get('/500', function(req, res, next) {
    next(500);
});

app.get('/error', function(req, res, next) {
    next(new Error('fuck you'));
})

// app.helpers == app.locals
app.locals(require('./common'));
app.locals({
    title: 'Posts'
});
app.dynamicHelpers({
    user: function(req){return req.session.user}
});

// Middlewares

// Routes

require('./lib/route').route(app);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
