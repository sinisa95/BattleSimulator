const eventTypes = require('../../server/models/enums/eventType');
const logger = require('../../logger');

// Handler for join event. Add joined army to list of enemies.
function joinEvent(newArmy) {
  logger.clientArmyLog(this.army, newArmy);
  this.army.enemies.push(newArmy);
}

// Handler for leave event. Remove leaved army from list of enemies or
// if leaved army is same as current army, that means current army is dead.
function leaveEvent(leavedArmy) {
  logger.clientLeaveEventLog(this.army, leavedArmy);
  if (this.army.id === leavedArmy.id) {
    this.army.squads = 0;
    return;
  }
  const index = this.army.enemies.findIndex((army) => army.id === leavedArmy.id);
  this.army.enemies.splice(index, 1);
}

// Handler for update event. Find enemy and update squad for that enemy or
// if attacked army is same as current army, update squads of current army.
function updateEvent(update) {
  logger.clientUpdateEventLog(this.army, update);
  if (this.army.id === update.attackedId) {
    if (this.army.squads !== update.attackedSquads) logger.clientLog(this.army, 'Ooouch!');
    this.army.squads = update.attackedSquads;
    return;
  }
  const attackedArmy = this.army.enemies.find((army) => army.id === update.attackedId);
  if (attackedArmy) attackedArmy.squads = update.attackedSquads;
}

class WebhookService {
  constructor(army) {
    this.army = army;
  }

  // For given eventType, call handler for that event. After that try to attack.
  handleWebhook(eventType, eventData) {
    if (eventType === eventTypes.JOIN) joinEvent.call(this, eventData);
    else if (eventType === eventTypes.LEAVE) leaveEvent.call(this, eventData);
    else if (eventType === eventTypes.UPDATE) updateEvent.call(this, eventData);
    this.army.attack();
  }
}

module.exports = WebhookService;
