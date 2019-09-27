const axios = require('axios');

const joinRequest = (serverURL, joinData) => axios.post(`${serverURL}/api/join`, joinData);

const returnRequest = (serverURL, accessToken) => axios.post(`${serverURL}/api/join?accessToken=${accessToken}`);

const leaveRequest = (serverURL, accessToken) => axios.put(`${serverURL}/api/leave?accessToken=${accessToken}`);

const attackRequest = (serverURL, accessToken, enemyId) => axios
  .put(`${serverURL}/api/attack/${enemyId}?accessToken=${accessToken}`);

module.exports = {
  joinRequest,
  returnRequest,
  leaveRequest,
  attackRequest,
};
