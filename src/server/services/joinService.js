const { BadRequestError, NotFoundError } = require('restify-errors');
const nanoid = require('nanoid');
const armyStates = require('../models/enums/armyState');
const eventTypes = require('../models/enums/eventType');
const joinTypes = require('../models/enums/joinType');
const logger = require('../../logger');

// Takes just neccesery fields from joined army and append all enemies in system.
const convertToResponse = (joinedArmy, armies) => ({
  id: joinedArmy.id,
  name: joinedArmy.name,
  webhookURL: joinedArmy.webhookURL,
  squads: joinedArmy.squads,
  accessToken: joinedArmy.accessToken,
  enemies: armies
    .filter((army) => army.id !== joinedArmy.id)
    .map((army) => ({ id: army.id, name: army.name, squads: army.squads })),
});


// Create new army.
// If succeed, join event is triggered.
function newJoin(newArmy) {
  return this.armyRepository.save({ ...newArmy, accessToken: nanoid() })
    .then((joinedArmy) => {
      logger.serverJoinLog(joinedArmy);
      this.webhookEvent.emit(eventTypes.JOIN, joinedArmy, joinTypes.NEW);
      return Promise.resolve(joinedArmy);
    }).catch((err) => Promise.reject(new BadRequestError(err)));
}


// Find army with given access token and set army to be active.
// If succeed, join event is triggered.
function returnJoin(accessToken) {
  const conditions = { accessToken, state: armyStates.LEAVED };
  const update = { state: armyStates.ACTIVE };
  return this.armyRepository.findOneAndUpdate(conditions, update, { new: true })
    .then((joinedArmy) => {
      if (!joinedArmy) throw new NotFoundError();
      logger.serverJoinLog(joinedArmy, true);
      this.webhookEvent.emit(eventTypes.JOIN, joinedArmy, joinTypes.RETURN);
      return Promise.resolve(joinedArmy);
    }).catch((err) => Promise.reject(new BadRequestError(err)));
}

class JoinService {
  constructor(armyRepository, webhookEvent) {
    this.armyRepository = armyRepository;
    this.webhookEvent = webhookEvent;
  }

  // Join(new or return) army and return data about joined army and active enemies.
  join(army, accessToken) {
    return Promise.all([
      accessToken == null ? newJoin.call(this, army) : returnJoin.call(this, accessToken),
      this.armyRepository.find({ state: armyStates.ACTIVE }),
    ]).then(([joinedArmy, armies]) => convertToResponse(joinedArmy, armies));
  }
}

module.exports = JoinService;
