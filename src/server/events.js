const { EventEmitter } = require('events');
const armyStates = require('./models/enums/armyState');
const EventType = require('./models/enums/eventType');
const LeaveTypes = require('./models/enums/leaveType');
const logger = require('../logger');

const sendWebhookToArmies = (armies, webhookData) => {
  armies.filter((army) => army.id !== webhookData.data.id).forEach((army) => {
    this.requests.sendWebhook(army.webhookURL, webhookData).catch(() => {
      this.armyRepository.update(army, { state: armyStates.LEAVED })
        .then(() => {
          logger.serverLeaveLog(army);
          this.WebhookEvent.emit(EventType.LEAVE, army.id, LeaveTypes.STOP);
        })
        .catch(() => logger.serverLog('Cannot update inactive army.'));
    });
  });
};

const webhookEvent = (eventData, eventType) => Promise.all([
  this.armyRepository.find({ state: { $ne: armyStates.LEAVED } }),
  this.webhookRepository.save({ data: eventData, eventType }),
]).then(([armies]) => sendWebhookToArmies(armies, { data: eventData, eventType }));

const WebhookEvent = new EventEmitter();

WebhookEvent.on(EventType.JOIN, (army, joinType) => setImmediate(() => {
  const webhookData = {
    id: army.id,
    name: army.name,
    squads: army.squads,
    joinType,
  };
  webhookEvent(webhookData, EventType.JOIN);
}));

WebhookEvent.on(EventType.LEAVE, (army, leaveType) => setImmediate(() => {
  webhookEvent({ id: army.id, leaveType }, EventType.LEAVE);
}));

WebhookEvent.on(EventType.UPDATE, (attackerId, attackedId, attackedSquads) => setImmediate(() => {
  webhookEvent({ attackerId, attackedId, attackedSquads }, EventType.UPDATE);
}));

module.exports = (armyRepository, webhookRepository, requests) => {
  this.armyRepository = armyRepository;
  this.webhookRepository = webhookRepository;
  this.requests = requests;
  return WebhookEvent;
};
