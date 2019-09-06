const { NotFoundError } = require('restify-errors');
const Army = require('../models/army');
const States = require('../models/enums/state');

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
  // console.log("Damage:" + damage);
  if (damage) return receiveDamage(attacked.squads, damage);
  return null;
};

const attack = (accessToken, armyId) => Promise.all([
  Army.findOne({ accessToken }),
  Army.findById(armyId),
]).then(([attacker, attacked]) => {
  if (!attacker && !attacked) return Promise.reject(new NotFoundError());
  return Promise.all([attacked, calculateDamage(attacker, attacked)]);
}).then(([attacked, damage]) => {
  if (!damage) {
    return Promise.resolve();
  }
  let update;
  if (attacked.squads <= damage) {
    update = { squads: 0, state: States.Dead };
  } else {
    update = { squads: attacked.squads - damage };
  }
  const updated = Object.assign(attacked, update);
  return updated.save();
}).catch((err) => Promise.reject(new NotFoundError(err)));


module.exports = (req, res, next) => {
  attack(req.query.accessToken, req.params.armyId)
    .then(() => {
      res.json();
      next();
    })
    .catch((err) => next(err));
};
