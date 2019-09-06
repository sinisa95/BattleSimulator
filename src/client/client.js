const restify = require('restify');
const axios = require('axios');

const webhooks = require('./webhooks');

const port = process.argv[2];

const server = restify.createServer({
  name: `Client ${port}`,
});

server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

webhooks(server);

server.listen(port, () => console.log(`${server.name} started on port ${port}`));

axios.post('http://localhost:8080/api/join', { 
  name: port, webhookURL: `http://localhost:${port}`, strategy: 'random', squads: 15,
})
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error);
  });
