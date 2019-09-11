const axios = require('axios');

exports.joinRequest = (clientData) => axios.post(`${clientData.url}/api/join`, {
  name: clientData.name,
  webhookURL: clientData.webhookURL,
  squads: clientData.squads,
});

exports.returnRequest = (clientData) => axios.post(`${clientData.url}/api/join?accessToken=${clientData.accessToken}`)
  .then((response) => {
    Object.assign(clientData, { armies: response.data.armies, squads: response.data.squads });
    if (clientData.armies.length > 0 && !clientData.attacking) this.attackRequest(clientData);
  }).catch(() => {
    Object.assign(clientData, { armies: [] });
    clientData.deadEvent.emit('dead');
  });

exports.attackRequest = (clientData) => {
  if (clientData.armies.length === 0) {
    Object.assign(clientData, { attacking: false });
    return Promise.resolve();
  }
  Object.assign(clientData, { attacking: true });
  const army = clientData.strategy(clientData.armies);
  return axios.put(`${clientData.url}/api/attack/${army.id}?accessToken=${clientData.accessToken}`)
    .then(() => this.attackRequest(clientData))
    .catch(() => Object.assign(clientData, { attacking: false }));
};

exports.leaveRequest = (clientData) => axios.put(`${clientData.url}/api/leave?accessToken=${clientData.accessToken}`)
  .then(() => Object.assign(clientData, { armies: [] }))
  .catch(() => {
    Object.assign(clientData, { armies: [] });
    clientData.deadEvent.emit('dead');
  });
