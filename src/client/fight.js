const Strategies = require('./strategy');
const { attackRequest } = require('./requests');

const randomFight = (data) => {
  if (data.armies.length === 0) return;
  const index = Math.floor(Math.random() * data.armies.length);
  const selectedArmy = data.armies[index];
  attackRequest(data, selectedArmy.armyId)
    .then(() => randomFight(data));
};

const minMaxFight = (data, isMin) => {
  if (data.armies.length === 0) return;
  const { armies } = data;
  const selectedArmy = armies.reduce((minMax, army) => {
    if (minMax === null) return army;
    return isMin && minMax.squads > army.squads ? army : minMax;
  }, null);
  attackRequest(data, selectedArmy.armyId)
    .then(() => minMaxFight(data, isMin));
};

module.exports = (data) => {
  const { strategy } = data;
  if (strategy === Strategies.RANDOM) randomFight(data);
  else if (strategy === Strategies.WEAKEST) minMaxFight(data, true);
  else if (strategy === Strategies.STRONGEST) minMaxFight(data, false);
};
