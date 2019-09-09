const { NotFoundError } = require('restify-errors');
const nanoid = require('nanoid');
const States = require('../models/enums/state');
const EventTypes = require('../models/enums/eventType');
const JoinTypes = require('../models/enums/joinType');
const logger = require('../../logger');

module.exports = (armyRepository, webhookEvent) => {
  const convertToResponse = (joinedArmy, armies) => ({
    id: joinedArmy.id,
    name: joinedArmy.name,
    webhookURL: joinedArmy.webhookURL,
    squads: joinedArmy.squads,
    accessToken: joinedArmy.accessToken,
    armies: armies
      .filter((army) => army.id !== joinedArmy.id)
      .map((army) => ({ id: army.id, name: army.name, squads: army.squads })),
  });

  const newJoin = (newArmy) => {
    Object.assign(newArmy, { accessToken: nanoid() });
    return armyRepository.save(newArmy)
      .then((army) => {
        logger.serverJoinLog(army);
        webhookEvent.emit(EventTypes.JOIN, army.id, army.squads, JoinTypes.NEW);
        return Promise.resolve(army);
      })
      .catch((err) => Promise.reject(err));
  };

  const returnJoin = (accessToken) => {
    const conditions = { accessToken, state: States.LEAVED };
    const update = { state: States.ACTIVE };
    return armyRepository.findOneAndUpdate(conditions, update)
      .then((army) => {
        if (!army) throw new NotFoundError();
        Object.assign(army, update);
        logger.serverJoinLog(army, true);
        webhookEvent.emit(EventTypes.JOIN, army.id, army.squads, JoinTypes.RETURN);
        return Promise.resolve(army);
      }).catch((err) => Promise.reject(err));
  };

  const join = (army, accessToken) => Promise.all([
    accessToken == null ? newJoin(army) : returnJoin(accessToken),
    armyRepository.find({ state: States.ACTIVE }),
  ]).then(([joinedArmy, armies]) => convertToResponse(joinedArmy, armies));

  return { join };
};
