const createClient = require('./client/client');
const armyRepository = require('./server/repositories/armyRepository');
const strategies = require('./client/enums/strategyType');
const armyStates = require('./server/models/enums/armyState');

require('./server/server');

// Data for clients in simulation.
const clients = [
  {
    port: 3001, name: 'One', squads: 42, strategy: strategies.STRONGEST, delay: 4000,
  },
  {
    port: 3002, name: 'Two', squads: 63, strategy: strategies.STRONGEST, delay: 5000,
  },
  {
    port: 3003, name: 'Three', squads: 98, strategy: strategies.STRONGEST, delay: 15000,
  },
  {
    port: 3004, name: 'Four', squads: 34, strategy: strategies.RANDOM, delay: 50000,
  },
  {
    port: 3005, name: 'Five', squads: 10, strategy: strategies.WEAKEST, delay: 20000,
  },
  {
    port: 3006, name: 'Six', squads: 100, strategy: strategies.STRONGEST, delay: 10000,
  },
  {
    port: 3007, name: 'Seven', squads: 54, strategy: strategies.WEAKEST, delay: 3000, leaveTime: 10000, returnTime: 30000,
  },
  {
    port: 3008, name: 'Eight', squads: 65, strategy: strategies.STRONGEST, delay: 5000,
  },
];

// Create all clients and make leave and return them if needed.
clients.forEach((clientData) => setTimeout(() => {
  const client = createClient(clientData);
  if (clientData.leaveTime) setTimeout(() => client.army.leave(), clientData.leaveTime);
  if (clientData.returnTime) setTimeout(() => client.army.return(), clientData.returnTime);
}, clientData.delay));


// If there is one active army, announce winner and stop simulation.
const makeWinnerOrPass = (activeArmies) => {
  if (activeArmies.length === 1) {
    const winner = activeArmies[0];
    console.log(`The winner is army '${winner.name}'`);
    process.exit();
  }
};

// Track dead armies and find all active armies and make winner or pass.
armyRepository.afterDeadEvent.on('dead', () => {
  armyRepository.find({ state: armyStates.ACTIVE })
    .then((activeArmies) => makeWinnerOrPass(activeArmies))
    .catch((err) => console.log(err));
});
