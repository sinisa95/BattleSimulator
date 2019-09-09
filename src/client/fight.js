const Strategies = require('./strategy');
const { attackRequest } = require('./requests');

module.exports = (clientData) => {
  const notFoundArmyDelete = (data, notFoundArmy) => {
    const index = data.armies.findIndex((army) => army.armyId === notFoundArmy.armyId);
    data.armies.splice(index, 1);
  };

  const randomFight = (data) => {
    const index = Math.floor(Math.random() * data.armies.length);
    const selectedArmy = data.armies[index];
    attackRequest(data, selectedArmy.armyId)
      .then(() => randomFight(data))
      .catch(() => {
        notFoundArmyDelete(data, selectedArmy);
        if (data.armies.length !== 0) randomFight(data);
      });
  };

  const minMaxFight = (data, isMin) => {
    const { armies } = data;
    const selectedArmy = armies.reduce((minMax, army) => {
      if (minMax === null) return army;
      return isMin && minMax.squads > army.squads ? army : minMax;
    }, null);
    attackRequest(data, selectedArmy.armyId)
      .then(() => minMaxFight(data, isMin))
      .catch(() => {
        notFoundArmyDelete(data, selectedArmy);
        if (data.armies.length !== 0) randomFight(data);
      });
  };

  const fight = () =>{
    if (clientData.armies.length === 0) return;
    const { strategy } = clientData;
    if (strategy === Strategies.RANDOM) randomFight(clientData);
    else if (strategy === Strategies.WEAKEST) minMaxFight(clientData, true);
    else if (strategy === Strategies.STRONGEST) minMaxFight(clientData, false);
  };

  return fight;
};
