const restify = require('restify');
const webhooks = require('./webhooks');
const { joinRequest } = require('./requests');
const fight = require('./fight');
const logger = require('../logger');

module.exports = (port, url, name, squads, strategy) => {
  const clientData = {
    id: null,
    accessToken: null,
    webhookURL: `http://localhost:${port}/webhook`,
    armies: [],
    strategy,
    name,
    squads,
    url,
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
    fight(clientData);
  }).catch(() => {
    logger.clientLog(clientData, 'Server error');
  });
};
