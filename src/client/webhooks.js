const armies = [];

const armyJoined = (req, res, next) => {

}

const armyUpdated = (req, res, next) => {

}

const armyLeaved = (req, res, next) => {

}

module.exports = (server) => {
  server.post('/army/join', armyJoined);
  server.post('/army/update', armyUpdated);
  server.post('/army/leave', armyLeaved);
};