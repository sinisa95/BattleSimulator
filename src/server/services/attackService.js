const { BadRequestError, NotFoundError } = require('restify-errors');
const armyStates = require('../models/enums/armyState');
const eventTypes = require('../models/enums/eventType');
const LeaveTypes = require('../models/enums/leaveType');
const logger = require('../../logger');

// Chance for successfull attack.
const attackChance = (squads) => 1 / squads;

// Chance for attacked army to receive half damage.
const halfDamageChance = (squads) => Math.abs(squads - 100) / 100;

// Make probability hit. Random gives number [0, 1) and chance is number [0, 1].
const probabilityHit = (chance) => Math.random() < chance;

// Calaculate damage by number of attacker squads and number of attack.
const takeDamage = (squads, attackNumber) => Math.floor(squads / attackNumber);

// Reload time for attacker
const reload = (squads) => new Promise((resolve) => {
  const seconds = Math.floor(squads / 10) + 1;
  setTimeout(resolve, seconds * 1000);
});

// Repeat attack while one attack succeed and return damage.
const repeatAttack = (squads) => {
  const chance = attackChance(squads);
  for (let i = 0; i < squads; i += 1) {
    if (probabilityHit(chance)) return takeDamage(squads, i + 1);
  }
  return null;
};

// Calculate received damage by number of attacked squads and initial damage.
const receiveDamage = (squads, damage) => {
  if (damage == null) return null;
  const chance = halfDamageChance(squads);
  return probabilityHit(chance) ? Math.floor(damage / 2) : damage;
};

// Calculate final damage.
const calculateDamage = (attacker, attacked) => {
  const damage = repeatAttack(attacker.squads);
  return receiveDamage(attacked.squads, damage);
};

// Apply final damage to attacked army
function applyDamage(attacker, attacked, damage) {
  if (!damage) {
    return Promise.resolve({ attacker, attacked, damage: 0 });
  }
  if (attacked.squads <= damage) {
    return this.armyRepository.update(attacked, { squads: 0, state: armyStates.DEAD })
      .then(() => Promise.resolve({ attacker, attacked, damage: attacked.squads }));
  }
  const { accessToken } = attacked;
  return this.armyRepository.findOneAndUpdate({ accessToken }, { squads: attacked.squads - damage })
    .then((oldArmy) => {
      if (oldArmy.state === armyStates.DEAD) {
        oldArmy.set('squads', 0);
        oldArmy.save().then(() => Promise.resolve({ attacker, attacked, damage: 0 }));
      }
      return Promise.resolve({ attacker, attacked, damage });
    });
}

// Trigger update event and if attacked army is dead also trigger leave event.
function afterDamage(eventData) {
  const { attacker, attacked, damage } = eventData;
  logger.serverAttackLog(attacker, attacked, damage);
  this.webhookEvent.emit(eventTypes.UPDATE, attacker.id, attacked.id, attacked.squads - damage);
  if (attacked.squads === damage) {
    logger.serverLog(`${attacked.name} is dead`);
    this.webhookEvent.emit(eventTypes.LEAVE, attacked, LeaveTypes.DEAD);
  }
  return Promise.resolve(eventData);
}

// Checking attacker and attacked to be valid armies.
const checkArmies = (attacker, attacked) => {
  const areActive = !attacker
    || !attacked
    || attacker.state !== armyStates.ACTIVE
    || attacked.state !== armyStates.ACTIVE;

  if (areActive) throw new NotFoundError();
  if (attacker.id === attacked.id) throw new BadRequestError();
};

class AttackService {
  constructor(armyRepository, webhookEvent) {
    this.armyRepository = armyRepository;
    this.webhookEvent = webhookEvent;
  }

  // Finds attacker by access token and attacked by id.
  // Then make validation and calculate damage, apply it.
  // If succeed, trigger update event and if needed leave event.
  // After that attacker have reload time.
  attack(accessToken, armyId) {
    return Promise.all([
      this.armyRepository.findOne({ accessToken }),
      this.armyRepository.findById(armyId),
    ]).then(([attacker, attacked]) => {
      checkArmies(attacker, attacked);
      const damage = calculateDamage.call(this, attacker, attacked);
      return applyDamage.call(this, attacker, attacked, damage);
    }).then((eventData) => afterDamage.call(this, eventData))
      .then((eventData) => reload(eventData.attacker.squads));
  }
}

module.exports = AttackService;
