const crypto = require('crypto');
const Army = require('../models/army');
const getArmy = require('./getArmy');

const generateToken = () => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(32,(err, buffer) => { 
            if (err)
                reject();
            resolve(buffer.toString('hex'));
        });
    });
}

const newJoin = (newArmy) => {
    const {name, squads, webhookURL} = newArmy;
    return generateToken()
        .then(accessToken => {
            const army = new Army({name, squads, webhookURL, accessToken});
            return army.save();       
        })
        .then(result => {
            return Promise.resolve(result); 
        })
        .catch(err => {
            return Promise.reject(err);
        });
}

const returnJoin = (accessToken) => {
    return getArmy(accessToken)
        .then(army => {
            if(!army)
                return Promise.reject(new Error("No army"));
            return Promise.resolve(army);
        })
        .catch(err => {
            return Promise.reject(err);
        });
   
}

const join = (army, accessToken) => {
    if(accessToken == null) 
        return newJoin(army);    
    else
        return returnJoin(accessToken);
}

module.exports = (req, res, next) => {
    join(req.body, req.query.accessToken)
        .then(result => {
            res.json(result);
            next();
        })
        .catch(err => {
            next(err);
        });
}

