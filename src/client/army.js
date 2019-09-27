const { EventEmitter } = require('events');
const selectStrategy = require('./services/selectStrategy');
const logger = require('../logger');

class Army {
  constructor(clientData, requests) {
    const {
      port,
      name,
      squads,
      strategy,
    } = clientData;

    this.port = port;
    this.name = name;
    this.squads = squads;
    this.serverURL = `${process.env.SERVER_URL}:${process.env.SERVER_PORT}`;
    this.webhookURL = `${process.env.CLIENT_URL}:${port}/webhook`;
    this.enemies = [];
    this.accessToken = null;
    this.id = null;
    this.attacking = false;
    this.strategy = selectStrategy(strategy);
    this.deadEvent = new EventEmitter();
    this.requests = requests;
    this.brojac = 0;
    this.join();
  }

  attack() {
    if (this.enemies.length === 0 || this.attacking) {
      return;
    }
    const enemy = this.strategy(this.enemies);
    this.attacking = true;
    this.brojac += 1;
    this.requests.attackRequest(this.serverURL, this.accessToken, enemy.id)
      .then(() => {
        this.attacking = false;
        this.brojac -= 1;
        this.attack();
      })
      .catch(() => {
        this.brojac -= 1;
        this.attacking = false;
      });
  }

  join() {
    const joinData = { name: this.name, webhookURL: this.webhookURL, squads: this.squads };
    this.requests.joinRequest(this.serverURL, joinData)
      .then((response) => {
        this.accessToken = response.data.accessToken;
        this.id = response.data.id;
        this.enemies = response.data.enemies;
        this.enemies.forEach((enemy) => logger.clientArmyLog(this, enemy));
        this.attack();
      }).catch(() => {
        logger.clientLog(this, 'JOIN: Server error');
      });
  }

  return() {
    this.requests.returnRequest(this.serverURL, this.accessToken)
      .then((response) => {
        this.enemies = response.data.enemies;
        this.enemies = response.data.squads;
        this.attack();
      }).catch(() => {
        this.enemies = [];
        this.attacking = false;
        this.deadEvent.emit('dead');
      });
  }

  leave() {
    this.requests.leaveRequest(this.serverURL, this.accessToken)
      .then(() => {
        this.enemies = [];
        this.attacking = false;
      })
      .catch(() => {
        this.enemies = [];
        this.attacking = false;
        this.deadEvent.emit('dead');
      });
  }
}

module.exports = Army;
