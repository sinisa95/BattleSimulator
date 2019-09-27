
# Battle Simulator

Battle Simulator is system with one main server and any number of clients. Server and client are imlempented as separate application using Node.js. Clients (Armies) communicate with the Server by using the REST API and JSON. The server communicates with the Clients by sending them a Webhook with JSON data.

## Installation

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Clone repository to local machine:
```bash 
$ git clone https://github.com/sinisa95/BattleSimulator.git    
```
Install dependencies:
```bash
$ npm install
```

## Usage

First is you must create `.env` file in the root of project which have all enivroment variables for Battle Simulator. 
For example:
```dosini
# .env

# Port for server
SERVER_PORT = 8080
# MongoDB URL
MONGO_URL = localhost/battlesimulator
# Server URL
SERVER_URL = http://localhost
# Client URL
CLIENT_URL = http://localhost
# Log server stuff on terminal
SERVER_LOG = true 
# Log client stuff on terminal
CLIENT_LOG = false
```
Start the simulation:
```bash
$ npm start
```
Drop database:
```bash
$ npm run dropDB
```
Start server only:
```bash
$ npm run server
```
To start client you need to provide: 
* port - port for the client server, 
* name - name of the client, 
* squads - number of squads between 10-100
* strategy - strategy which is client used to decide whick client(army) to attack. Strategy can be:
  * weakest
  * strongest
  * random
  
Start client only:
```bash
$ npm run client <port> <name> <squads> <strategy>
```

Lint code:
```bash
$ npm run eslint
```
