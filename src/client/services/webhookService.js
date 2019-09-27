const eventTypes = require('../../server/models/enums/eventType');
const logger = require('../../logger');

function joinEvent(newArmy) {
  logger.clientArmyLog(this.army, newArmy);
  this.army.enemies.push(newArmy);
}

function leaveEvent(leavedArmy) {
  logger.clientLeaveEventLog(this.army, leavedArmy);
  const index = this.army.enemies.findIndex((army) => army.id === leavedArmy.id);
  if (index !== -1) this.army.enemies.splice(index, 1);
  if (this.army.id === leavedArmy.id) this.army.enemies = [];
}

function updateEvent(update) {
  logger.clientUpdateEventLog(this.army, update);
  if (this.army.squads === 0) return;

  if (this.army.id === update.attackedId) {
    if (this.army.squads !== update.attackedSquads) logger.clientLog(this.army, 'Ooouch!');
    this.army.squads = update.attackedSquads;
    if (update.attackedSquads === 0) {
      this.army.deadEvent.emit('dead');
      this.army.enemies = [];
    }
  } else {
    const attackedArmy = this.army.enemies.find((army) => army.id === update.attackedId);
    if (attackedArmy) attackedArmy.squads = update.attackedSquads;
  }
}

class WebhookService {
  constructor(army) {
    this.army = army;
  }

  handleWebhook(eventType, eventData) {
    if (eventType === eventTypes.JOIN) joinEvent.call(this, eventData);
    else if (eventType === eventTypes.LEAVE) leaveEvent.call(this, eventData);
    else if (eventType === eventTypes.UPDATE) updateEvent.call(this, eventData);
    this.army.attack();
  }
}

module.exports = WebhookService;
