const Joi = require('@hapi/joi');
const { BadRequestError } = require('restify-errors');

module.exports = (validation) => (req, res, next) => {
  const validationResult = Object.keys(validation)
    .map((key) => Joi.validate(req[key], validation[key]))
    .find((result) => result.error !== null);
  if (validationResult) return next(new BadRequestError(validationResult.error));
  return next();
};
