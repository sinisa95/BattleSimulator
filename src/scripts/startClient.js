const createClient = require('../client/client');

const clientData = {
  port: process.argv[2],
  name: process.argv[3],
  squads: process.argv[4],
  strategy: process.argv[5],
};

createClient(clientData);
