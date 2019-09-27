const { NotFoundError } = require('restify-errors');
const states = require('../models/enums/state');
const eventTypes = require('../models/enums/eventType');
const LeaveTypes = require('../models/enums/leaveType');
const logger = require('../../logger');

class LeaveService {
  constructor(armyRepository, webhookEvent) {
    this.armyRepository = armyRepository;
    this.webhookEvent = webhookEvent;
  }

  leave(accessToken) {
    const conditions = { accessToken };
    const update = { state: states.LEAVED };
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
