const restify = require('restify');
const mongoose = require('mongoose');
const setupController = require('./controller');
const logger = require('../logger');
const armyRepository = require('./repositories/armyRepository');
const webhookRepository = require('./repositories/webhookRepository');
const createJoinService = require('./services/joinService');
const createAttackService = require('./services/attackService');
const createLeaveService = require('./services/leaveService');
const createWebhookEvents = require('./events');

const webhookEvent = createWebhookEvents(armyRepository, webhookRepository);
const joinService = createJoinService(armyRepository, webhookEvent);
const attackService = createAttackService(armyRepository, webhookEvent);
const leaveService = createLeaveService(armyRepository, webhookEvent);

mongoose.connect('mongodb://localhost/battlesimulator', { useNewUrlParser: true });

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

mongoose.connection.once('open', () => logger.serverLog('Connected to MongoDB'));
mongoose.connection.on('error', (err) => logger.serverLog(`Database error: ${err}`));

const port = 8080;

const server = restify.createServer({
  name: 'BattleSimulatorServer',
});

server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

setupController(server, { joinService, attackService, leaveService });

server.listen(port, () => logger.serverLog(`Started on port ${port}`));
