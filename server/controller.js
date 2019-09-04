const join = require('./services/join');
const attack = require('./services/attack');
const leave = require('./services/leave');

module.exports = (server) =>{
    server.post('/api/join', join);
    server.put('/api/attack/:armyId', attack);
    server.put('/api/leave', leave);
};