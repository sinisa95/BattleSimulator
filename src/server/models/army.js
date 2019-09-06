const mongoose = require('mongoose');
const States = require('./enums/state');

const ArmySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  webhookURL: {
    type: String,
    required: true,
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
    enum: Object.values(States),
    default: States.Active,
  },
});

module.exports = mongoose.model('army', ArmySchema);
