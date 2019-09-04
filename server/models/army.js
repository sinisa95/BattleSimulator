const mongoose = require('mongoose');

const ArmySchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  squads: {
    type: Number,
    required: true
  },
  webhookURL: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('army', ArmySchema);