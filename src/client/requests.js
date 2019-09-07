const axios = require('axios');

exports.joinRequest = (data) => axios.post(`${data.url}/api/join`, {
  name: data.name,
  webhookURL: data.webhookURL,
  squads: data.squads,
});

exports.attackRequest = (data, armyId) => axios.put(`${data.url}/api/attack/${armyId}?accessToken=${data.accessToken}`);
