const { BadRequestError, NotFoundError } = require('restify-errors');
const States = require('../models/enums/state');
const EventTypes = require('../models/enums/eventType');
const logger = require('../../logger');

module.exports = (armyRepository, webhookEvent) => {
  const attackChance = (squads) => 1 / squads;

  const halfDamageChance = (squads) => Math.abs(squads - 100) / 100;

  const probabilityHit = (chance) => Math.random() < chance;

  const takeDamage = (squads, attackNumber) => Math.floor(squads / attackNumber);

  const reload = () => new Promise((resolve) => setTimeout(resolve, 1000));

  const repeatAttack = async (squads) => {
    const chance = attackChance(squads);
    for (let i = 0; i < squads; i += 1) {
      if (probabilityHit(chance)) {
        return takeDamage(squads, i + 1);
      }
      if ((i % 10) - 9 === 0) {
        // console.log('sleep');
        await reload();
      }
    }
    return null;
  };

  const receiveDamage = (squads, damage) => {
    const chance = halfDamageChance(squads);
    return probabilityHit(chance) ? Math.floor(damage / 2) : damage;
  };

  const calculateDamage = async (attacker, attacked) => {
    const damage = await repeatAttack(attacker.squads);
    if (damage) return receiveDamage(attacked.squads, damage);
    return null;
  };

  const attack = (accessToken, armyId) => Promise.all([
    armyRepository.findOne({ accessToken }),
    armyRepository.findById(armyId),
  ]).then(([attacker, attacked]) => {
    if (!attacker
      || !attacked
      || attacker.state !== States.ACTIVE
      || attacked.state !== States.ACTIVE
    ) {
      throw new NotFoundError();
    }
    if (attacker.id === attacked.id) {
      throw new BadRequestError();
    }
    logger.serverLog(`${attacker.name} attacks ${attacked.name}`);
    return Promise.all([attacker, attacked, calculateDamage(attacker, attacked)]);
  }).then(([attacker, attacked, damage]) => {
    let promise;
    let update;
    if (damage) {
      if (attacked.squads <= damage) {
        update = { squads: 0, state: States.DEAD };
      } else {
        update = { squads: attacked.squads - damage };
      }
      promise = armyRepository.update(attacked, update);
    } else {
      promise = Promise.resolve();
    }
    logger.serverLog(`${attacker.name} damage ${attacked.name} ${update.squads}`);
    webhookEvent.emit(EventTypes.UPDATE, attacker.id, attacked.id, update.squads);
    return promise;
  });

  return { attack };
};
