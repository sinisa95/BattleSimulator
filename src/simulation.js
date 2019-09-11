const Client = require('./client/client');
const Strategies = require('./client/strategyType');
require('./server/server');

const url = 'http://localhost:8080';

const clients = [
  {
    port: 3001, name: 'One', squads: 42, strategy: Strategies.STRONGEST, delay: 4000, dead: false,
  },
  {
    port: 3002, name: 'Two', squads: 63, strategy: Strategies.STRONGEST, delay: 5000, dead: false,
  },
  {
    port: 3003, name: 'Three', squads: 98, strategy: Strategies.STRONGEST, delay: 15000, dead: false,
  },
  {
    port: 3004, name: 'Four', squads: 34, strategy: Strategies.RANDOM, delay: 50000, dead: false,
  },
  {
    port: 3005, name: 'Five', squads: 72, strategy: Strategies.WEAKEST, delay: 20000, dead: false,
  },
  {
    port: 3006, name: 'Six', squads: 100, strategy: Strategies.STRONGEST, delay: 10000, dead: false,
  },
  {
    port: 3007, name: 'Seven', squads: 54, strategy: Strategies.WEAKEST, delay: 3000, dead: false,
  },
  {
    port: 3008, name: 'Eight', squads: 65, strategy: Strategies.STRONGEST, delay: 5000, dead: false,
  },
];

clients.forEach((clientData, index) => setTimeout(() => {
  const client = Client(clientData.port, url,
    clientData.name, clientData.squads, clientData.strategy);
  client.deadEvent.on('dead', () => {
    clients[index].dead = true;
    if (clients.filter((c) => !c.dead).length === 1) {
      const indexWinner = clients.findIndex((c) => !c.dead);
      const winner = clients[indexWinner];
      console.log(`The winner is army '${winner.name}'`);
      process.exit();
    }
  });
  if (index === 6) {
    setTimeout(() => client.leave(), 10000);
    setTimeout(() => client.return(), 30000);
  }
}, clientData.delay));
