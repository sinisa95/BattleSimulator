const Webhook = require('../models/webhook');

exports.findOneAndUpdate = (conidtion, update) => Webhook.findOneAndUpdate(conidtion, update);

exports.save = (webhook) => new Webhook(webhook).save();

exports.update = (webhook, update) => new Webhook(Object.assign(webhook, update)).save();
