const { NotFoundError } = require('restify-errors');
const nanoid = require('nanoid');
const Army = require('../models/army');
const States = require('../models/enums/state');

const newJoin = (newArmy) => {
  const army = new Army(Object.assign(newArmy, { accessToken: nanoid() }));
  return army.save()
    .then((result) => Promise.resolve(result))
    .catch((err) => Promise.reject(err));
};

const returnJoin = (accessToken) => Army.findOneAndUpdate({ accessToken }, { state: States.Active })
  .then((army) => {
    if (!army) return Promise.reject(new NotFoundError('No army'));
    return Promise.resolve(Object.assign(army, { state: States.Active }));
  })
  .catch((err) => Promise.reject(err));


const join = (army, accessToken) => {
  if (accessToken != null) return returnJoin(accessToken);
  return newJoin(army);
};

module.exports = (req, res, next) => {
  // console.log('JOIN ' + req.href());
  join(req.body, req.query.accessToken)
    .then((result) => {
      res.json(result);
      next();
    })
    .catch((err) => next(err));
};
