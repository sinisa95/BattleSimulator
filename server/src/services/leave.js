const Army = require('../models/army');
const States = require('../models/enums/state');
const { NotFoundError } = require('restify-errors');

const leave = (accessToken) => {
    return Army.findOneAndUpdate({accessToken}, {state: States.Leaved})
        .then(army => army ? Promise.resolve() : Promise.reject(new NotFoundError()))
        .catch(err => Promise.reject(err));  
}

module.exports = (req, res, next) => {
    console.log('LEAVE ' + req.url);
    leave(req.query.accessToken)
        .then(() => {
            res.json();
            next();
        })
        .catch(err => {
            next(err);
        });
}