const crypto = require('crypto');
const Army = require('../models/army');
const States = require('../models/enums/state')
const { NotFoundError } = require('restify-errors');

const generateToken = () => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(32,(err, buffer) => { 
            if (err)
                reject();
            resolve(buffer.toString('hex'));
        });
    });
}

const generateUniqueToken = async () => {
    while(true){
        const token = await generateToken()
        const army = await Army.findOne({accessToken: token});
        if(army == null)
            return token;
    }   
}

const newJoin = (newArmy) => {
    const {name, squads, webhookURL, strategy} = newArmy;
    return generateUniqueToken()
        .then(accessToken => {
            const army = new Army({name, squads, webhookURL, accessToken, strategy});
            return army.save();       
        })
        .then(result => Promise.resolve(result))
        .catch(err =>Promise.reject(err));
}

const returnJoin = (accessToken) => {
    return Army.findOneAndUpdate({accessToken}, {state: States.Active})
        .then(army => {
            if(!army)
                return Promise.reject(new NotFoundError("No army"));
            army.state = States.Active;
            return Promise.resolve(army);
        })
        .catch(err =>  Promise.reject(err));
   
}

const join = (army, accessToken) => {
    if(accessToken == null) 
        return newJoin(army);    
    else
        return returnJoin(accessToken);
}

module.exports = (req, res, next) => {
    console.log('JOIN ' + req.href());
    join(req.body, req.query.accessToken)
        .then(result => {
            res.json(result);
            next();
        })
        .catch(err => {
            next(err);
        });
}

