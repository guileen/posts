var OAuth = require('oauth').OAuth
  , logger = require('nlogger').logger(module)
  , service = require('./service')
  , querystring = require('querystring');

var getRequestTokenUrl = "https://www.google.com/accounts/OAuthGetRequestToken";

// GData specifid: scopes that wa want access to
var gdataScopes = [
  // contact info
  // querystring.escape("https://www.google.com/m8/feeds/"),
  querystring.escape('http://www.google.com/reader/api')
];


var googleOAuth = new OAuth(getRequestTokenUrl + "?scope=" + gdataScopes.join('+'),
  "https://www.google.com/accounts/OAuthGetAccessToken",
  "anonymous",
  "anonymous",
  "1.0",
  "http://dev:3000/google-callback", //+( req.param('action') ? "?action="+querystring.escape(req.param('action')) : "" ),
  "HMAC-SHA1");

OAuth.prototype.setCallback = function (url) {
  // this is not a good solution to do for multi callback url, 
  // use session to store the user last operation, as the callback url
  this._authorize_callback = url;
  return this;
};


exports.route = function(app) {

  // Request an OAuth Request Token, and redirects the user to authorize it
  app.get('/google-login', function(req, res, next) {

      googleOAuth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
          if (error) {
            logger.debug(error);
            return next(error);
          }
          else { 
            // store the tokens in the session
            req.session.oauth_token = oauth_token;
            req.session.oauth_token_secret = oauth_token_secret;

            // redirect the user to authorize the token
            res.redirect("https://www.google.com/accounts/OAuthAuthorizeToken?oauth_token=" + encodeURIComponent(oauth_token));
          }
      });

  });

  // Callback for the authorization page
  app.get('/google-callback', function(req, res, next) {

      // get the OAuth access token with the 'oauth_verifier' that we received

      googleOAuth.getOAuthAccessToken(
        req.session.oauth_token, 
        req.session.oauth_token_secret, 
        req.param('oauth_verifier'), 
        function(error, oauth_access_token, oauth_access_token_secret, results2) {

          if (error) {
            logger.debug(error);
            return next(error);
          }
          else {

            // store the access token in the session
            req.session.oauth_access_token = oauth_access_token;
            req.session.oauth_access_token_secret = oauth_access_token_secret;
            res.redirect(req.param('action') || req.session.google_callback_url);
          }

      });

  });


  function require_google_login(req, res, next) {
    if (!req.session.oauth_access_token) {
      req.session.google_callback_url = req.url;
      res.redirect("/google-login?action=" + querystring.escape(req.url));
      return;
    }
    next();
  };

  app.get('/google-reader', require_google_login, function(req, res, next) {

      // Example using GData API v3
      // GData Specific Header
      googleOAuth._headers['GData-Version'] = '3.0'; 

      googleOAuth.getProtectedResource(
        'http://www.google.com/reader/api/0/subscription/list?output=json',
        "GET",
        req.session.oauth_access_token,
        req.session.oauth_access_token_secret,
        function (err, data, response) {
          if (err) return next(err);

          var feeds = JSON.parse(data);
          console.log(feeds);
          feeds = feeds.subscriptions.map(function(item) {
              if(item.id.indexOf('feed/') != 0) {
                console.log('========== feed id is special =============');
              }
              console.log(item);
              return {
                id: item.id.substring(5)
              , title : item.title
              , tags : item.categories.map(function(cate) {return cate.label})
              , link : item.htmlUrl
              }
          });

          service.importFeeds(req.session.user, feeds, function(err, results) {
              if(err) return next(err);
              res.redirect(req.param.next || '/preferences');
          });
      });


  });

  app.get('/google-contacts', require_google_login, function(req, res, next) {

      // Example using GData API v3
      // GData Specific Header
      googleOAuth._headers['GData-Version'] = '3.0'; 

      googleOAuth.getProtectedResource(
        "https://www.google.com/m8/feeds/contacts/default/full?alt=json", 
        "GET", 
        req.session.oauth_access_token, 
        req.session.oauth_access_token_secret,
        function (error, data, response) {

          var feed = JSON.parse(data);

          res.render('google_contacts.ejs', {
              locals: { feed: feed }
          });
      });

  });

  app.get('/google-calendars', require_google_login, function(req, res, next) {

      // Example using GData API v2
      // GData Specific Header
      googleOAuth._headers['GData-Version'] = '2'; 

      googleOAuth.getProtectedResource(
        "https://www.google.com/calendar/feeds/default/allcalendars/full?alt=jsonc", 
        "GET", 
        req.session.oauth_access_token, 
        req.session.oauth_access_token_secret,
        function (error, data, response) {

          var feed = JSON.parse(data);

          res.render('google_calendars.ejs', {
              locals: { feed: feed }
          });
      });

  });

};
