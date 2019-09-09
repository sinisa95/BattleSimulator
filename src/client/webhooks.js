const EventTypes = require('../server/models/enums/eventType');
const fight = require('./fight');
const logger = require('../logger');

module.exports = (server, clientData) => {
  const joinEvent = (newArmy) => {
    clientData.armies.push(newArmy);
    logger.clientArmyLog(clientData, newArmy);
    // if (data.armies.length === 1) fight(data);
  };

  const leaveEvent = (leavedArmy) => {
    const index = clientData.armies.findIndex((army) => army.armyId === leavedArmy.armyId);
    clientData.armies.splice(index, 1);
  };

  const updateEvent = (update) => {
    const attackedArmy = clientData.armies.find((army) => army.armyId === update.attackedId);
    attackedArmy.squads = update.squads;
  };

  const webhook = () => (req, res, next) => {
    const { eventType } = req.body;
    if (eventType === EventTypes.JOIN) joinEvent(req.body.data);
    else if (eventType === EventTypes.LEAVE) leaveEvent(req.body.data);
    else if (eventType === EventTypes.UPDATE) updateEvent(req.body.data);
    // logger.clientEventLog(clientData, req.body);
    res.json();
    next();
  };

  server.post('/webhook', webhook());
};
