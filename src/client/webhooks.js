const EventType = require('../server/models/enums/eventType');
const fight = require('./fight');

const joinEvent = (data, newArmy) => {
  if (data.id === newArmy.armyId) return;
  data.armies.push(newArmy);
  // if (data.armies.length === 1) fight(data);
};

const leaveEvent = (data, leavedArmy) => {
  const index = data.armies.findIndex((army) => army.armyId === leavedArmy.armyId);
  data.armies.splice(index, 1);
};

const updateEvent = (data, update) => {

};

const webhook = (data) => (req, res, next) => {
  const { eventType } = req.body;
  if (eventType === EventType.JOIN) joinEvent(data, req.body.data);
  else if (eventType === EventType.LEAVE) leaveEvent(data, req.body.data);
  else if (eventType === EventType.UPDATE) updateEvent(data, req.body.data);
  console.log(req.body);
  res.json();
  next();
};

module.exports = (server, data) => {
  server.post('/webhook', webhook(data));
};
