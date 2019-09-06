const { NotFoundError } = require('restify-errors');
const nanoid = require('nanoid');
const chalk = require('chalk');
const Army = require('../models/army');
const States = require('../models/enums/state');
const Events = require('../events');
const JoinType = require('../models/enums/joinType');

const createJoinEventData = (army) => (
  {
    armyId: army.id,
    squads: army.squads,
    type: army.state === States.ACTIVE ? JoinType.NEW : JoinType.RETURN,
  }
);


const newJoin = (newArmy) => {
  const army = new Army(Object.assign(newArmy, { accessToken: nanoid() }));
  return army.save()
    .then((result) => Promise.resolve(result))
    .catch((err) => Promise.reject(err));
};

const returnJoin = (accessToken) => Army.findOneAndUpdate({ accessToken }, { state: States.ACTIVE })
  .then((army) => {
    if (!army) return Promise.reject(new NotFoundError('No army'));
    return Promise.resolve(army);
  })
  .catch((err) => Promise.reject(err));


const join = (army, accessToken) => {
  if (accessToken != null) return returnJoin(accessToken);
  return newJoin(army);
};


module.exports = (req, res, next) => {
  join(req.body, req.query.accessToken)
    .then((army) => {
      res.json({ ...army.toObject(), state: States.ACTIVE });
      next();
      console.log(`${chalk.green('JOIN')} armyId: ${chalk.cyanBright(army.id)} squads: ${chalk.yellow(army.squads)}`);
      return Events.joinEvent(createJoinEventData(army));
    }).catch((err) => next(err));
};
