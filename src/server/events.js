const axios = require('axios');
const chalk = require('chalk');
const Army = require('./models/army');
const Webhook = require('./models/webhook');
const States = require('./models/enums/state');
const EventType = require('./models/enums/eventType');
const LeaveTypes = require('./models/enums/leaveType');

const sendData = (url, data) => axios.post(`${url}`, data);

const triggerEvent = (data, eventType) => {
  const webhook = new Webhook({ data, eventType });
  webhook.save().then((newWebhook) => {
    Army.find({ state: States.ACTIVE }).then((armies) => {
      const promises = armies
        .map((army) => new Promise((resovle) => {
          sendData(army.webhookURL, { eventType, data })
            .then((response) => resovle({ army, success: response.status === 200 }))
            .catch(() => resovle({ army, success: false }));
        }));
      Promise.all(promises).then((armyPromises) => {
        const receivedArmies = armyPromises
          .filter((armyPromise) => armyPromise.success)
          .map((armyPromise) => armyPromise.army);
        newWebhook.receivedArmies.push(...receivedArmies);
        newWebhook.save();
        armyPromises.filter((armyPromise) => !armyPromise.success)
          .map((armyPromise) => Object.assign(armyPromise.army, { state: States.LEAVED }))
          .forEach((army) => {
            console.log(`${chalk.green('STOP')} armyId: ${chalk.cyanBright(army.id)} squads: ${chalk.yellow(army.squads)}`);
            army.save()
              .then(() => this.leaveEvent({ armyId: army.id, type: LeaveTypes.STOP }));
          });
      });
    });
  });
};

exports.joinEvent = (data) => {
  triggerEvent(data, EventType.JOIN);
};

exports.leaveEvent = (data) => {
  triggerEvent(data, EventType.LEAVE);
};

exports.updateEvent = (data) => {
  triggerEvent(data, EventType.UPDATE);
};
