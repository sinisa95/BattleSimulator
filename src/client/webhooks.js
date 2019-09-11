const EventTypes = require('../server/models/enums/eventType');
const logger = require('../logger');
const { attackRequest } = require('./requests');

module.exports = (server, clientData) => {
  const joinEvent = (newArmy) => {
    clientData.armies.push(newArmy);
    logger.clientArmyLog(clientData, newArmy);
  };

  const leaveEvent = (leavedArmy) => {
    logger.clientLeaveEventLog(clientData, leavedArmy);
    const index = clientData.armies.findIndex((army) => army.id === leavedArmy.id);
    if (index !== -1) clientData.armies.splice(index, 1);
  };

  const updateEvent = (update) => {
    logger.clientUpdateEventLog(clientData, update);
    if (clientData.squads === 0) return;

    if (clientData.id === update.attackedId) {
      if (clientData.squads !== update.attackedSquads) logger.clientLog(clientData, 'Ooouch!');
      Object.assign(clientData, { squads: update.attackedSquads });
      if (update.attackedSquads === 0) {
        clientData.deadEvent.emit('dead');
        Object.assign(clientData, { armies: [] });
      }
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

    if (!clientData.attacking) attackRequest(clientData);

    res.json();
    next();
  };

  server.post('/webhook', webhook);
};
