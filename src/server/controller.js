const armyValidation = require('./validations/armyValidation');
const validator = require('./validations/validator');

module.exports = (server, services) => {
  const { joinService, attackService, leaveService } = services;

  server.post('/api/join', validator(armyValidation), (req, res, next) => {
    joinService.join(req.body, req.query.accessToken)
      .then((result) => res.json(result) || next())
      .catch((err) => next(err));
  });

  server.put('/api/attack/:armyId',  (req, res, next) => {
    attackService.attack(req.query.accessToken, req.params.armyId)
      .then((result) => res.json(result) || next())
      .catch((err) => next(err));
  });

  server.put('/api/leave', (req, res, next) => {
    leaveService.leave(req.query.accessToken)
      .then((result) => res.json(result) || next())
      .catch((err) => next(err));
  });
};
