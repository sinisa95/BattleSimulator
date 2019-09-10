const axios = require('axios');

exports.joinRequest = (clientData) => axios.post(`${clientData.url}/api/join`, {
  name: clientData.name,
  webhookURL: clientData.webhookURL,
  squads: clientData.squads,
});

exports.returnRequest = (clientData) => axios.post(`${clientData.url}/api/join?accessToken=${clientData.accessToken}`)
  .then((response) => {
    Object.assign(clientData, { armies: response.data.armies });
    if (clientData.armies.length > 0) this.attackRequest(clientData);
  }).catch(() => {
    Object.assign(clientData, { armies: [] });
    clientData.deadEvent.emit('dead');
  });

exports.attackRequest = (clientData) => {
  const army = clientData.strategy(clientData.armies);
  if (clientData.armies.length === 0) return Promise.resolve();
  return axios.put(`${clientData.url}/api/attack/${army.id}?accessToken=${clientData.accessToken}`)
    .then(() => this.attackRequest(clientData))
    .catch(() => {
      const index = clientData.armies.findIndex((a) => a.id === army.id);
      clientData.armies.splice(index, 1);
      if (clientData.armies.length > 0) this.attackRequest(clientData);
    });
};

exports.leaveRequest = (clientData) => axios.put(`${clientData.url}/api/leave?accessToken=${clientData.accessToken}`)
  .catch(() => {
    Object.assign(clientData, { armies: [] });
    clientData.deadEvent.emit('dead');
  });
