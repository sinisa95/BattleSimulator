const { BadRequestError } = require('restify-errors');
const Joi = require('@hapi/joi');

// Joi schema for request body for new army.
const bodySchema = Joi.object().keys({
  name: Joi.string().required(),
  webhookURL: Joi.string().required(),
  squads: Joi.number().integer().min(10).max(100)
    .required(),
});

// Validate body only if not have access token.
const validate = (body, accessToken) => {
  if (accessToken) return Promise.resolve();
  return bodySchema.validate(body).catch((err) => Promise.reject(new BadRequestError(err)));
};

module.exports = validate;
