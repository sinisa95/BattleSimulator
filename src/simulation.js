const Client = require('./client/client');
const Strategies = require('./client/strategy');
require('./server/server');

setTimeout(() => Client(3001, 'http://localhost:8080', 'First', 50, Strategies.STRONGEST), 5000);
setTimeout(() => Client(3002, 'http://localhost:8080', 'Second', 50, Strategies.STRONGEST), 5000);
setTimeout(() => Client(3003, 'http://localhost:8080', 'Third', 100, Strategies.STRONGEST), 5000);
// Client(3004, 'http://localhost:8080', 'Fourth', 34, Strategies.RANDOM);
// Client(3005,'http://localhost:8080', 'Fifth', 72, Strategies.WEAKEST);
