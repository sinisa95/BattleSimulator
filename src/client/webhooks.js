const EventTypes = require('../server/models/enums/eventType');
const logger = require('../logger');
const { attackRequest } = require('./requests');

module.exports = (server, clientData) => {
  const joinEvent = (newArmy) => {
    clientData.armies.push(newArmy);
    logger.clientArmyLog(clientData, newArmy);
    if (clientData.armies.length === 1) attackRequest(clientData);
  };

  const leaveEvent = (leavedArmy) => {
    logger.clientLeaveEventLog(clientData, leavedArmy);
    const index = clientData.armies.findIndex((army) => army.id === leavedArmy.id);
    clientData.armies.splice(index, 1);
  };

  const updateEvent = (update) => {
    logger.clientUpdateEventLog(clientData, update);
    if (clientData.id === update.attackedId) {
      if (clientData.squads !== update.attackedSquads) logger.clientLog(clientData, 'Ooouch!');
      Object.assign(clientData, { squads: update.attackedSquads });
      if (update.attackedSquads === 0) clientData.deadEvent.emit('dead');
    } else {
      const attackedArmy = clientData.armies.find((army) => army.id === update.attackedId);
      if (attackedArmy) attackedArmy.squads = update.attackedSquads;
    }
  };

  const webhook = (req, res, next) => {
    const { eventType } = req.body;
    if (eventType === EventTypes.JOIN) joinEvent(req.body.data);
    else if (eventType === EventTypes.LEAVE) leaveEvent(req.body.data);
    else if (eventType === EventTypes.UPDATE) updateEvent(req.body.data);
    res.json();
    next();
  };

  server.post('/webhook', webhook);
};
