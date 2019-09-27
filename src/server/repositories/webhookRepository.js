const Webhook = require('../models/webhook');

const findOneAndUpdate = (conditions, update) => Webhook.findOneAndUpdate(conditions, update);

const save = (webhook) => new Webhook(webhook).save();

const update = (webhook, webhookUpdate) => new Webhook({ ...webhook, ...webhookUpdate }).save();

module.exports = {
  findOneAndUpdate,
  save,
  update,
};
