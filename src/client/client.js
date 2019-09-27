const Army = require('./army');
const createClientServer = require('./clientServer');
const requests = require('./services/requests');

const createClient = (clientData) => {
  const army = new Army(clientData, requests);
  const server = createClientServer(army);
  return { army, server };
};

module.exports = createClient;
