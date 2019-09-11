const { EventEmitter } = require('events');
const restify = require('restify');
const {
  joinRequest, attackRequest, returnRequest, leaveRequest,
} = require('./requests');
const webhooks = require('./webhooks');

const selectStrategy = require('./strategy');
const logger = require('../logger');

module.exports = (port, url, name, squads, strategy) => {
  const clientData = {
    name,
    squads,
    url,
    webhookURL: `http://localhost:${port}/webhook`,
    strategy: selectStrategy(strategy),
    armies: [],
    accessToken: null,
    id: null,
    attacking: false,
    deadEvent: new EventEmitter(),
  };

  const server = restify.createServer({ name });
  server.use(restify.plugins.bodyParser());
  server.use(restify.plugins.queryParser());
  webhooks(server, clientData);
  server.listen(port, () => logger.clientLog(clientData, `Started on port ${port}`));

  joinRequest(clientData).then((response) => {
    clientData.accessToken = response.data.accessToken;
    clientData.id = response.data.id;
    clientData.armies = response.data.armies;
    clientData.armies.forEach((army) => logger.clientArmyLog(clientData, army));
    if (!clientData.attacking) attackRequest(clientData);
  }).catch(() => {
    logger.clientLog(clientData, 'Server error');
  });

  return {
    deadEvent: clientData.deadEvent,
    return: () => returnRequest(clientData),
    leave: () => leaveRequest(clientData),
  };
};
