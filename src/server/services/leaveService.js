const { NotFoundError } = require('restify-errors');
const armyStates = require('../models/enums/armyState');
const eventTypes = require('../models/enums/eventType');
const LeaveTypes = require('../models/enums/leaveType');
const logger = require('../../logger');

class LeaveService {
  constructor(armyRepository, webhookEvent) {
    this.armyRepository = armyRepository;
    this.webhookEvent = webhookEvent;
  }

  // Find army with given access token and set army to be inactive(leaved).
  // If succeed, leave event is triggered.
  leave(accessToken) {
    const conditions = { accessToken };
    const update = { state: armyStates.LEAVED };
    return this.armyRepository.findOneAndUpdate(conditions, update, { new: true })
      .then((army) => {
        if (!army) throw new NotFoundError();
        logger.serverLeaveLog(army);
        this.webhookEvent.emit(eventTypes.LEAVE, army, LeaveTypes.LEAVED);
        return Promise.resolve();
      });
  }
}

module.exports = LeaveService;
