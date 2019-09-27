const mongoose = require('mongoose');
const states = require('./enums/state');

const ArmySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  webhookURL: {
    type: String,
    required: true,
    unique: true,
  },
  accessToken: {
    type: String,
    required: true,
    unique: true,
  },
  squads: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    required: true,
    enum: Object.values(states),
    default: states.ACTIVE,
  },
});

module.exports = mongoose.model('army', ArmySchema);
