const strategies = require('../enums/strategyType');

const randomFight = (enemies) => {
  const index = Math.floor(Math.random() * enemies.length);
  return enemies[index];
};

const minMaxFight = (checker) => (enemies) => enemies.reduce((minMax, army) => {
  if (minMax === null || checker(minMax.squads, army.squads)) return army;
  return minMax;
}, null);

const minimum = (a, b) => a > b;
const maximum = (a, b) => a < b;

const selectStrategy = (strategy) => {
  if (strategy === strategies.RANDOM) return randomFight;
  if (strategy === strategies.WEAKEST) return minMaxFight(minimum);
  if (strategy === strategies.STRONGEST) return minMaxFight(maximum);
  throw new Error('No strategy');
};

module.exports = selectStrategy;
