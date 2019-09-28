const axios = require('axios');

// Function for sending request(webhook) to client
const sendWebhook = (webhookURL, webhookData) => axios.post(`${webhookURL}`, webhookData);

module.exports = {
  sendWebhook,
};
