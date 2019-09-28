const restify = require('restify');
const mongoose = require('mongoose');
const registerController = require('./controller');
const logger = require('../logger');
const armyRepository = require('./repositories/armyRepository');
const webhookRepository = require('./repositories/webhookRepository');
const JoinService = require('./services/joinService');
const AttackService = require('./services/attackService');
const LeaveService = require('./services/leaveService');
const createWebhookEvents = require('./events');
const requests = require('./requests');

// Create all services and events for server application
const webhookEvent = createWebhookEvents(armyRepository, webhookRepository, requests);
const joinService = new JoinService(armyRepository, webhookEvent);
const attackService = new AttackService(armyRepository, webhookEvent);
const leaveService = new LeaveService(armyRepository, webhookEvent);

/**
 *  Options for mongoose to not use deprecated stuff.
 *  More about this deprecations on 'https://mongoosejs.com/docs/deprecations.html'.
*/
const connectionOptions = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
};

mongoose.connect(`mongodb://${process.env.MONGO_URL}`, connectionOptions);
mongoose.connection.once('open', () => logger.serverLog('Connected to MongoDB'));
mongoose.connection.on('error', (err) => logger.serverLog(`Database error: ${err}`));

const port = process.env.SERVER_PORT;

const server = restify.createServer({
  name: 'BattleSimulatorServer',
});

server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

registerController(server, { joinService, attackService, leaveService });

server.listen(port, () => logger.serverLog(`Started on port ${port}`));
