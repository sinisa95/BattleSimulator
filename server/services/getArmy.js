const Army = require('../models/army');

module.exports = (accessToken) => {
    return Army.findOne({ accessToken })
        .then( army => {
            return Promise.resolve(army); 
        }) 
        .catch(err => {
            return Promise.reject(err);
        });
}