const mongoose = require('mongoose');
const EventTypes = require('./enums/eventType');

const WebhookSchema = mongoose.Schema({
  data: {
    type: Object,
    required: true,
  },
  eventType: {
    type: String,
    required: true,
    enum: Object.values(EventTypes),
  },
});

module.exports = mongoose.model('webhook', WebhookSchema);
