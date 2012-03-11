var zmq = require('zmq');

zmq.bindSync(config.msgSock);
