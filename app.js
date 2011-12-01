
/**
 * Module dependencies.
 */

var express = require('express');
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
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// helpers
app.helpers(require('./common'));
app.dynamicHelpers({
    user: function(req){return req.session.user}
});

// Middlewares

// Routes

require('./lib/route').route(app);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
