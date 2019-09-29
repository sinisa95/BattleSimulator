const strategies = require('../enums/strategyType');

// Random strategy, for given enemies returns random enemy.
const randomFight = (enemies) => {
  const index = Math.floor(Math.random() * enemies.length);
  return enemies[index];
};

// minMaxFight for given checker returns function for weakest or strongest strategy
const minMaxFight = (checker) => (enemies) => enemies.reduce((minMax, army) => {
  if (minMax === null || checker(minMax.squads, army.squads)) return army;
  return minMax;
}, null);

const minimum = (a, b) => a > b; // checker for weakest strategy
const maximum = (a, b) => a < b; // checker for strongest strategy

// For given string(strategy) returns strategy function
const selectStrategy = (strategy) => {
  if (strategy === strategies.RANDOM) return randomFight;
  if (strategy === strategies.WEAKEST) return minMaxFight(minimum);
  if (strategy === strategies.STRONGEST) return minMaxFight(maximum);
  throw new Error('No strategy');
};

module.exports = selectStrategy;
