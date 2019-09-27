const restify = require('restify');
const registerController = require('./controller');
const WebhookService = require('./services/webhookService');
const logger = require('../logger');

const createClientServer = (army) => {
  const webhookService = new WebhookService(army);
  const server = restify.createServer({ name: army.name });
  server.use(restify.plugins.bodyParser());
  server.use(restify.plugins.queryParser());
  registerController(server, { webhookService });
  server.listen(army.port, () => logger.clientLog(army, `Started on port ${army.port}`));
  return server;
};

module.exports = createClientServer;
