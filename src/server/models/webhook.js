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
  receivedArmies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'army',
  }],

});

module.exports = mongoose.model('webhook', WebhookSchema);
