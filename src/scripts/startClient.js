const Client = require('../client/client');

Client(process.argv[2], 'http://localhost:8080', process.argv[3], process.argv[4], process.argv[5]);
