const axios = require('axios');

const sendWebhook = (webhookURL, data) => axios.post(`${webhookURL}`, data);

module.exports = {
  sendWebhook,
};
