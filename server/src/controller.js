const join = require('./services/join');
const attack = require('./services/attack');
const leave = require('./services/leave');

const armyValidation = require('./validations/armyValidation')
const validator = require('./validations/validator');

module.exports = (server) =>{
    server.post('/api/join', validator(armyValidation), join);
    server.put('/api/attack/:armyId', attack);
    server.put('/api/leave', leave);
};