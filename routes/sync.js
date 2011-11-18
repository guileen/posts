var OAuth = require('oauth').OAuth
  , querystring = require('querystring');

exports.route = function(app) {
  app.get('/sync/google-reader', function(req, res, next) {
      if(!req.session.google_oauth_token) {
        res.redirect('/sync/google-login');
      }
  });


  // Request an OAuth Request Token, and redirects the user to authorize it
  app.get('/sync/google-login', function(req, res, next) {

      var getRequestTokenUrl = "https://www.google.com/accounts/OAuthGetRequestToken";

      // GData specifid: scopes that wa want access to
      var gdataScopes = [
        // contact info
        // querystring.escape("https://www.google.com/m8/feeds/"),
        querystring.escape('http://www.google.com/reader/api')
      ];

      var oa = new OAuth(getRequestTokenUrl+"?scope="+gdataScopes.join('+'),
        "https://www.google.com/accounts/OAuthGetAccessToken",
        "anonymous",
        "anonymous",
        "1.0",
        "http://localhost:3000/callback/google"+( req.param('action') ? "?action="+querystring.escape(req.param('action')) : "" ),
        "HMAC-SHA1");

      oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
          if(error) {
            console.log('error');
            console.log(error);
            next(error);
          }
          else { 
            // store the tokens in the session
            req.session.oa = oa;
            req.session.oauth_token = oauth_token;
            req.session.oauth_token_secret = oauth_token_secret;

            // redirect the user to authorize the token
            res.redirect("https://www.google.com/accounts/OAuthAuthorizeToken?oauth_token="+oauth_token);
          }
      })

  });

  // Callback for the authorization page
  app.get('/callback/google', function(req, res, next) {

      // get the OAuth access token with the 'oauth_verifier' that we received

      var oa = new OAuth(req.session.oa._requestUrl,
        req.session.oa._accessUrl,
        req.session.oa._consumerKey,
        req.session.oa._consumerSecret,
        req.session.oa._version,
        req.session.oa._authorize_callback,
        req.session.oa._signatureMethod);

      console.log(oa);

      oa.getOAuthAccessToken(
        req.session.oauth_token, 
        req.session.oauth_token_secret, 
        req.param('oauth_verifier'), 
        function(error, oauth_access_token, oauth_access_token_secret, results2) {

          if(error) {
            console.log('error');
            console.log(error);
          }
          else {

            // store the access token in the session
            req.session.oauth_access_token = oauth_access_token;
            req.session.oauth_access_token_secret = oauth_access_token_secret;

            res.redirect((req.param('action') && req.param('action') != "") ? req.param('action') : "/google-contacts");
          }

      });

  });


  function require_google_login(req, res, next) {
    if(!req.session.oauth_access_token) {
      console.log('originalUrl:' + req.originalUrl);
      res.redirect("/sync/google-login?action="+querystring.escape(req.originalUrl));
      return;
    }
    next();
  };

  app.get('/google-readers', require_google_login, function(req, res, next) {
      var oa = new OAuth(req.session.oa._requestUrl,
        req.session.oa._accessUrl,
        req.session.oa._consumerKey,
        req.session.oa._consumerSecret,
        req.session.oa._version,
        req.session.oa._authorize_callback,
        req.session.oa._signatureMethod);

      console.log("in google-reader:" + oa);

      // Example using GData API v3
      // GData Specific Header
      oa._headers['GData-Version'] = '3.0'; 

      oa.getProtectedResource(
        'http://www.google.com/reader/api/0/subscription/list?output=json',
        "GET",
        req.session.oauth_access_token,
        req.session.oauth_access_token_secret,
        function (err, data, response) {
          if(err) return next(err);

          var feed = JSON.parse(data);
          console.log(feed);

          res.render('import_google_reader.jade', {
              feed: feed
          });
      });


  });

  app.get('/google-contacts', require_google_login, function(req, res, next) {
      var oa = new OAuth(req.session.oa._requestUrl,
        req.session.oa._accessUrl,
        req.session.oa._consumerKey,
        req.session.oa._consumerSecret,
        req.session.oa._version,
        req.session.oa._authorize_callback,
        req.session.oa._signatureMethod);

      console.log(oa);

      // Example using GData API v3
      // GData Specific Header
      oa._headers['GData-Version'] = '3.0'; 

      oa.getProtectedResource(
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
      var oa = new OAuth(req.session.oa._requestUrl,
        req.session.oa._accessUrl,
        req.session.oa._consumerKey,
        req.session.oa._consumerSecret,
        req.session.oa._version,
        req.session.oa._authorize_callback,
        req.session.oa._signatureMethod);
      // Example using GData API v2
      // GData Specific Header
      oa._headers['GData-Version'] = '2'; 

      oa.getProtectedResource(
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

  app.listen(3000);
  console.log("listening on http://localhost:3000");

}
