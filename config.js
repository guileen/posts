var config = module.exports = {
  uploadPath : '/Users/gl/var/upload'
, staticRoot : 'http://dev:9000/upload'
, db : require('mongoskin').db('mongodb://localhost/posts')
, redis : require('redis').createClient()
, msgSock : 'tcp://127.0.0.1:20001'
};
