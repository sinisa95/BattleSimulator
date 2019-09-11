const { BadRequestError, NotFoundError } = require('restify-errors');
const States = require('../models/enums/state');
const EventTypes = require('../models/enums/eventType');
const LeaveTypes = require('../models/enums/leaveType');
const logger = require('../../logger');

module.exports = (armyRepository, webhookEvent) => {
  const attackChance = (squads) => 1 / squads;

  const halfDamageChance = (squads) => Math.abs(squads - 100) / 100;

  const probabilityHit = (chance) => Math.random() < chance;

  const takeDamage = (squads, attackNumber) => Math.floor(squads / attackNumber);

  const reload = (squads) => new Promise((resolve) => {
    const seconds = Math.floor(squads / 10);
    setTimeout(resolve, seconds * 1000);
  });

  const repeatAttack = (squads) => {
    const chance = attackChance(squads);
    for (let i = 0; i < squads; i += 1) {
      if (probabilityHit(chance)) {
        return takeDamage(squads, i + 1);
      }
    }
    return null;
  };

  const receiveDamage = (squads, damage) => {
    const chance = halfDamageChance(squads);
    return probabilityHit(chance) ? Math.floor(damage / 2) : damage;
  };

  const calculateDamage = (attacker, attacked) => {
    const damage = repeatAttack(attacker.squads);
    if (damage) return receiveDamage(attacked.squads, damage);
    return null;
  };

  const applyDamage = (attacker, attacked, damage) => {
    if (!damage) {
      return Promise.resolve({
        attacker,
        attacked,
        damage: 0,
        dead: false,
      });
    }
    if (attacked.squads <= damage) {
      return armyRepository.update(attacked, { squads: 0, state: States.DEAD })
        .then(() => Promise.resolve({
          attacker,
          attacked,
          damage: attacked.squads,
          dead: true,
        }));
    }
    const { accessToken } = attacked;
    return armyRepository.findOneAndUpdate({ accessToken }, { squads: attacked.squads - damage })
      .then((oldArmy) => {
        if (oldArmy.state === States.DEAD) {
          oldArmy.set('squads', 0);
          oldArmy.save();
          return Promise.resolve({
            attacker,
            attacked,
            damage: 0,
            dead: true,
          });
        }
        return Promise.resolve({
          attacker,
          attacked,
          damage,
          dead: false,
        });
      });
  };

  const afterDamage = (eventData) => {
    const {
      attacker, attacked, damage, dead,
    } = eventData;

    logger.serverLog(`${attacker.name} attacks ${attacked.name} with damage ${damage}`);
    webhookEvent.emit(EventTypes.UPDATE, attacker.id, attacked.id, attacked.squads - damage);
    if (dead) {
      logger.serverLog(`${attacked.name} is dead`);
      webhookEvent.emit(EventTypes.LEAVE, attacked.id, LeaveTypes.DEAD);
    }
    return Promise.resolve();
  };

  const attack = (accessToken, armyId) => Promise.all([
    armyRepository.findOne({ accessToken }),
    armyRepository.findById(armyId),
  ]).then(([attacker, attacked]) => {
    if (!attacker || !attacked
      || attacker.state !== States.ACTIVE || attacked.state !== States.ACTIVE
    ) {
      throw new NotFoundError();
    }
    if (attacker.id === attacked.id) {
      throw new BadRequestError();
    }
    const damage = calculateDamage(attacker, attacked);
    return Promise.all([attacker, attacked, damage]);
  }).then(([attacker, attacked, damage]) => {
    const reloadPromise = reload(attacker.squads);
    return Promise.all([attacker, attacked, damage, reloadPromise]);
  }).then(([attacker, attacked, damage]) => applyDamage(attacker, attacked, damage))
    .then((eventData) => afterDamage(eventData));
  return { attack };
};
