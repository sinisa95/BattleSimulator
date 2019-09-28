const { EventEmitter } = require('events');
const mongoose = require('mongoose');
const armyStates = require('./enums/armyState');

const afterDeadEvent = new EventEmitter();

const armySchema = mongoose.Schema({
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
    enum: Object.values(armyStates),
    default: armyStates.ACTIVE,
  },
});

// Hook for updateOne function which emits event when army is dead.
armySchema.post('updateOne', function updateOneHook() {
  if (this.getUpdate().state === armyStates.DEAD) afterDeadEvent.emit('dead');
});

module.exports = mongoose.model('army', armySchema);
module.exports.afterDeadEvent = afterDeadEvent;
