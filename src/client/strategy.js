const Strategies = require('./strategyType');

module.exports = (strategy) => {
  const randomFight = (armies) => {
    const index = Math.floor(Math.random() * armies.length);
    return armies[index];
  };

  const minMaxFight = (checker) => (armies) => armies.reduce((minMax, army) => {
    if (minMax === null || checker(minMax.squads, army.squads)) return army;
    return minMax;
  }, null);


  const minimum = (a, b) => a > b;
  const maximum = (a, b) => a < b;

  if (strategy === Strategies.RANDOM) return randomFight;
  if (strategy === Strategies.WEAKEST) return minMaxFight(minimum);
  if (strategy === Strategies.STRONGEST) return minMaxFight(maximum);
  throw new Error('No strategy');
};
