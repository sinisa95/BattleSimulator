const { NotFoundError } = require('restify-errors');
const States = require('../models/enums/state');
const EventTypes = require('../models/enums/eventType');
const LeaveTypes = require('../models/enums/leaveType');
const logger = require('../../logger');


module.exports = (armyRepository, webhookEvent) => {
  const leave = (accessToken) => {
    const conditions = { accessToken };
    const update = { state: States.LEAVED };
    return armyRepository.findOneAndUpdate(conditions, update)
      .then((army) => {
        if (!army) throw new NotFoundError();
        logger.serverLeaveLog(army);
        webhookEvent.emit(EventTypes.LEAVE, army.id, LeaveTypes.LEAVED);
        return Promise.resolve(army);
      })
      .catch((err) => Promise.reject(err));
  };
  return { leave };
};
