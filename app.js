
/**
 * Module dependencies.
 */

var express = require('express');
var settings = require('./settings');
var RedisStore = require('connect-redis')(express);

var app = module.exports = express.createServer();

var development = app.settings.env == 'development';

// hack express render to support pjax
var res = /*3.x*/ express.response || /*2.x*/ require('http').ServerResponse.prototype
var _render = res.render
var _slice = Array.prototype.slice;
res.render = function() {
  var args = _slice.call(arguments);
  if(this.req.xhr || this.req.query._pjax){
    args[0] = args[0] + '-pjax';
    // render('xxx'), not support render('xxx.jade')
    // if you want this, use below lines
    // var i = args[0].lastIndexOf('.');
    // args[0] = (i === -1) ? args[0] + '-pjax' : args[0].substring(0, i) + '-pjax' + args[0].substring(i);
  }
  _render.apply(this, args);
}
// Configuration

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {pretty: development, layout: false});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "keyboard cat", store: new RedisStore }));
  app.use(require('connect-less')({ src: __dirname + '/public/', compress: !development }));
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

  for (var name in settings) {
    app.set(name, settings[name]);
  }
});

app.configure('development', function() {
  // app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  // app.use(express.errorHandler());
});

app.use(function(err, req, res, next) {
    // TODO send status code, and make this static
    if (err == 404) {
      res.render('404');
    } else if (err == 500) {
      res.render('500');
    } else if (err instanceof Error) {
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
});

// app.helpers == app.locals
app.locals(require('./common'));
app.locals({
    title: 'Posts'
});
app.dynamicHelpers({
    user: function(req) {return req.session.user}
  , pjax: function(req) {return req.query._pjax == 'true'}
});

// Middlewares

// Routes

require('./lib/route').route(app);

// node-dev app.js 5000
app.listen(process.argv[2] || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
