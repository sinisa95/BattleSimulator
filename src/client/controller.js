// Register webhook api route for client.
// This function gets restify server and all services for handling specific routes.
const registerController = (server, services) => {
  const { webhookService } = services;

  server.post('/webhook', (req, res, next) => {
    const { eventType, data } = req.body;
    webhookService.handleWebhook(eventType, data);
    res.json();
    next();
  });
};

module.exports = registerController;
