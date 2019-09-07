const restify = require('restify');
const webhooks = require('./webhooks');
const { joinRequest } = require('./requests');

const setupServer = (name, port, data) => {
  const server = restify.createServer({ name });
  server.use(restify.plugins.bodyParser());
  server.use(restify.plugins.queryParser());
  webhooks(server, data);
  server.listen(port, () => console.log(`${server.name} started on port ${port}`));
};

module.exports = (url, name, squads, strategy, port) => {
  const data = {
    id: null,
    accessToken: null,
    webhookURL: `http://localhost:${port}/webhook`,
    armies: [],
    strategy,
    name,
    squads,
    url,
  };
  setupServer(name, port, data);
  joinRequest(data).then((response) => {
    data.accessToken = response.data.accessToken;
    data.id = response.data._id;
  }).catch((err) => {
    console.log('Server error');
    console.log(err);
  });
};
