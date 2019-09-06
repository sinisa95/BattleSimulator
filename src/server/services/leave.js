const { NotFoundError } = require('restify-errors');
const chalk = require('chalk');
const Army = require('../models/army');
const States = require('../models/enums/state');
const Events = require('../events');
const LeaveTypes = require('../models/enums/leaveType');

const leave = (accessToken) => Army.findOneAndUpdate({ accessToken }, { state: States.LEAVED })
  .then((army) => {
    if (army) return Promise.resolve(army);
    return Promise.reject(new NotFoundError());
  })
  .catch((err) => Promise.reject(err));

module.exports = (req, res, next) => {
  // console.log('LEAVE ' + req.url);
  leave(req.query.accessToken)
    .then((army) => {
      res.json();
      next();
      console.log(`${chalk.red('LEAVE')} armyId: ${chalk.cyanBright(army.id)} squads: ${chalk.yellow(army.squads)}`);
      Events.leaveEvent({ armyId: army.id, type: LeaveTypes.LEAVED });
    })
    .catch((err) => {
      next(err);
    });
};
