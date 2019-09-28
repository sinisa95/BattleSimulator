const Webhook = require('../models/webhook');

/**
 * Find one webhook that meet all conditions and update with defined properties.
 * @param {Object} conditions
 * @param {Object} update
 * @returns {Promise<Webhook>} Promise for webhook
 */
const findOneAndUpdate = (conditions, update) => Webhook.findOneAndUpdate(conditions, update);

/**
 * Save a new webhook
 * @param {Object} webhook
 * @returns {Promise<Webhook>} Promise for created webhook
 */
const save = (webhook) => new Webhook(webhook).save();

module.exports = {
  findOneAndUpdate,
  save,
};
