const Joi = require('@hapi/joi');

module.exports = { 
    body: Joi.object().keys({
        name:       Joi.string().required(),
        webhookURL: Joi.string().required(),
        squads:     Joi.number().integer().min(10).max(100).required()
    })
}




