const restify = require('restify');
const mongoose = require('mongoose');
const controller = require('./controller');

mongoose.connect('mongodb://localhost/battlesimulator', {useNewUrlParser: true});

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

mongoose.connection.once('open', () => console.log("Connected to MongoDB"));
mongoose.connection.on('error', (err) => console.log('Database error: '+err));

const port = 8080;

const server = restify.createServer({
    name:'BattleSimulatorServer'
});

server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

controller(server);

server.listen(port, () => console.log(`${server.name} started on port ${port}`));

