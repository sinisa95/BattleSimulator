const { BadRequestError, NotFoundError } = require('restify-errors');
const states = require('../models/enums/state');
const eventTypes = require('../models/enums/eventType');
const LeaveTypes = require('../models/enums/leaveType');
const logger = require('../../logger');

const attackChance = (squads) => 1 / squads;

const halfDamageChance = (squads) => Math.abs(squads - 100) / 100;

const probabilityHit = (chance) => Math.random() < chance;

const takeDamage = (squads, attackNumber) => Math.floor(squads / attackNumber);

const reload = (squads) => new Promise((resolve) => {
  const seconds = Math.floor(squads / 10) + 1;
  setTimeout(resolve, seconds * 1000);
});

const repeatAttack = (squads) => {
  const chance = attackChance(squads);
  for (let i = 0; i < squads; i += 1) {
    if (probabilityHit(chance)) return takeDamage(squads, i + 1);
  }
  return null;
};

const receiveDamage = (squads, damage) => {
  if (damage == null) return null;
  const chance = halfDamageChance(squads);
  return probabilityHit(chance) ? Math.floor(damage / 2) : damage;
};

const calculateDamage = (attacker, attacked) => {
  const damage = repeatAttack(attacker.squads);
  return receiveDamage(attacked.squads, damage);
};

function applyDamage(attacker, attacked, damage) {
  if (!damage) {
    return Promise.resolve({ attacker, attacked, damage: 0 });
  }
  if (attacked.squads <= damage) {
    return this.armyRepository.update(attacked, { squads: 0, state: states.DEAD })
      .then(() => Promise.resolve({ attacker, attacked, damage: attacked.squads }));
  }
  const { accessToken } = attacked;
  return this.armyRepository.findOneAndUpdate({ accessToken }, { squads: attacked.squads - damage })
    .then((oldArmy) => {
      if (oldArmy.state === states.DEAD) {
        oldArmy.set('squads', 0);
        oldArmy.save().then(() => Promise.resolve({ attacker, attacked, damage: 0 }));
      }
      return Promise.resolve({ attacker, attacked, damage });
    });
}

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

const checkArmies = (attacker, attacked) => {
  const areActive = !attacker
    || !attacked
    || attacker.state !== states.ACTIVE
    || attacked.state !== states.ACTIVE;

  if (areActive) throw new NotFoundError();
  if (attacker.id === attacked.id) throw new BadRequestError();
};

class AttackService {
  constructor(armyRepository, webhookEvent) {
    this.armyRepository = armyRepository;
    this.webhookEvent = webhookEvent;
  }

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
