const { EventEmitter } = require('events');
const axios = require('axios');
const States = require('./models/enums/state');
const EventType = require('./models/enums/eventType');
const LeaveTypes = require('./models/enums/leaveType');
const logger = require('../logger');

module.exports = (armyRepository, webhookRepository) => {
  const WebhookEvent = new EventEmitter();

  const sendData = (army, data) => axios.post(`${army.webhookURL}`, data);

  const sendWebhookToArmies = (armies, webhookData) => {
    armies.filter((army) => army.id !== webhookData.data.id).forEach((army) => {
      sendData(army, webhookData).catch(() => {
        armyRepository.update(army, { state: States.LEAVED })
          .then(() => {
            logger.serverLeaveLog(army);
            WebhookEvent.emit(EventType.LEAVE, army.id, LeaveTypes.STOP);
          })
          .catch(() => {});
      });
    });
  };

  const webhookEvent = (eventData, eventType) => Promise.all([
    armyRepository.find({ state: { $ne: States.LEAVED } }),
    webhookRepository.save({ data: eventData, eventType }),
  ]).then(([armies]) => sendWebhookToArmies(armies, { data: eventData, eventType }));

  WebhookEvent.on(EventType.JOIN, (armyId, name, squads, joinType) => setImmediate(() => {
    const webhookData = {
      id: armyId, name, squads, joinType,
    };
    webhookEvent(webhookData, EventType.JOIN);
  }));

  WebhookEvent.on(EventType.LEAVE, (armyId, leaveType) => setImmediate(() => {
    webhookEvent({ id: armyId, leaveType }, EventType.LEAVE);
  }));

  WebhookEvent.on(EventType.UPDATE, (attackerId, attackedId, attackedSquads) => setImmediate(() => {
    webhookEvent({ attackerId, attackedId, attackedSquads }, EventType.UPDATE);
  }));

  return WebhookEvent;
};
