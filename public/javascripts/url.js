// URL parse utility
//
// Author: Gui Lin 
//
// guileen AT gmail DOT com
//
// this function is use to strip url not validation
function parseUrl (url) {
  var r = /^(\w+):\/\/([^\/\?#]+)(\/[^\?#]*)?(\?[^#]*)?(#.*)?$/i.exec(url);
  return r && {
    schema : r[1]
  , domain : r[2]
  , root : r[1] + '://' + r[2]
  , path : r[3]
  , querystring : r[4]
  , anchor : r[5]
  };
}

if(typeof module !== 'undefined' && module.exports) {
  exports.parse = parseUrl;
}
