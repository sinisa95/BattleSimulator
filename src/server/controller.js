const armyValidation = require('./validations/armyValidation');

// Midlleware for army validation
const armyValidate = (req, res, next) => {
  armyValidation(req.body, req.query.accessToken)
    .then(() => next())
    .catch((err) => next(err));
};

// Handle promise from service
const handlePromise = (promise, res, next) => promise
  .then((result) => res.json(result) || next())
  .catch((err) => next(err));


// Register all api routes for server.
// This function gets restify server and all services for handling specific routes.
const registerController = (server, services) => {
  const { joinService, attackService, leaveService } = services;

  // This route has two middlewares, first for request validation and second for handling request.
  server.post('/api/join', armyValidate, (req, res, next) => {
    const joinPromise = joinService.join(req.body, req.query.accessToken);
    handlePromise(joinPromise, res, next);
  });

  server.put('/api/attack/:armyId', (req, res, next) => {
    const attackPromise = attackService.attack(req.query.accessToken, req.params.armyId);
    handlePromise(attackPromise, res, next);
  });

  server.put('/api/leave', (req, res, next) => {
    const leavePromise = leaveService.leave(req.query.accessToken);
    handlePromise(leavePromise, res, next);
  });
};

module.exports = registerController;
