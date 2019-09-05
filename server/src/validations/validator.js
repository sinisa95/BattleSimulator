const Joi = require('@hapi/joi');
const { BadRequestError } = require('restify-errors');

module.exports = (validation) => {
    return (req, res, next) =>{
        for(let key in validation){
            const result = Joi.validate(req[key], validation[key]);
            if(result.error !== null){ 
                return next(new BadRequestError(result.error));
            }    
        }
        return next();
    }
}