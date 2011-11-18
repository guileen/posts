var crypto = require('crypto');

function hash(algorithm, str){
  var hash = crypto.createHash(algorithm);
  hash.update(str);
  return hash.digest('hex');
}

module.exports = {
  hash : hash
  , md5 : function(str) {
    return hash('md5', str);
  }
  , sha1 : function(str) {
    return hash('sha1', str);
  }
  , avatar : function(md5, size) {
    var avatar = 'http://www.gravatar.com/avatar/' + md5 + '?d=retro';
    if(size){
      return avatar + '&s=' + size;
    }
    return avatar;
  }

}
