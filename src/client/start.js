const Client = require('./client');
const Strategies = require('./strategy');

Client('http://localhost:8080', 'First', 50, Strategies.STRONGEST, process.argv[2]);
