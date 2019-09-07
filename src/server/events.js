const axios = require('axios');
const chalk = require('chalk');
const Army = require('./models/army');
const Webhook = require('./models/webhook');
const States = require('./models/enums/state');
const EventType = require('./models/enums/eventType');
const LeaveTypes = require('./models/enums/leaveType');
const JoinType = require('./models/enums/joinType');


const createJoinEventData = (army) => (
  {
    armyId: army.id,
    squads: army.squads,
    type: army.state === States.ACTIVE ? JoinType.NEW : JoinType.RETURN,
  }
);

const sendData = (army, data) => new Promise((resovle) => {
  axios.post(`${army.webhookURL}`, data)
    .then((response) => resovle({ army, success: response.status === 200 }))
    .catch(() => resovle({ army, success: false }));
});

const handleArmiesPromises = (webhook, promises) => {
  if (promises.length === 0) return Promise.resolve();
  return Promise.all(promises).then((armyPromises) => {
    armyPromises.filter((armyPromise) => !armyPromise.success)
      .map((armyPromise) => Object.assign(armyPromise.army, { state: States.LEAVED }))
      .forEach((army) => {
        console.log(`${chalk.red('STOP')} armyId: ${chalk.cyanBright(army.id)} squads: ${chalk.yellow(army.squads)}`);
        army.save()
          .then(() => this.leaveEvent({ armyId: army.id, type: LeaveTypes.STOP }));
      });
    const receivedArmies = armyPromises
      .filter((armyPromise) => armyPromise.success)
      .map((armyPromise) => armyPromise.army);
    webhook.receivedArmies.push(...receivedArmies);
    return webhook.save().then(() => Promise.resolve);
  }).catch((err) => console.log(err));
};

const triggerEvent = (eventData, eventType) => {
  const webhook = new Webhook({ data: eventData, eventType });
  return Promise.all([
    webhook.save(),
    Army.find({ state: States.ACTIVE }),
  ]).then(([newWebhook, armies]) => {
    const armiesPromises = armies.map((army) => sendData(army, { eventType, data: eventData }));
    return handleArmiesPromises(newWebhook, armiesPromises);
  });
};

const triggerOldEvents = (army) => Webhook.find({ receivedArmies: { $ne: army.id } })
  .then((webhooks) => {
    webhooks.forEach((webhook) => {
      sendData(army, { eventType: webhook.eventType, data: webhook.data })
        .then((response) => {
          if (response.success) {
            webhook.receivedArmies.push(army);
            webhook.save();
          }
        });
    });
  });

exports.joinEvent = (army) => {
  triggerEvent(createJoinEventData(army), EventType.JOIN)
    .then(() => triggerOldEvents(army));
};

exports.leaveEvent = (data) => {
  triggerEvent(data, EventType.LEAVE);
};

exports.updateEvent = (data) => {
  triggerEvent(data, EventType.UPDATE);
};
