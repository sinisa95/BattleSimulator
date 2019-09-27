const mongoose = require('mongoose');
const eventType = require('./enums/eventType');

const WebhookSchema = mongoose.Schema({
  data: {
    type: Object,
    required: true,
  },
  eventType: {
    type: String,
    required: true,
    enum: Object.values(eventType),
  },
});

module.exports = mongoose.model('webhook', WebhookSchema);
