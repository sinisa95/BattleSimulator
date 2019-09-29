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

    // Initiliaze all field for army
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
    this.requests = requests;
    this.join();
  }

  // Find enemy using strategy and attack that enemy. If succeed attack again.
  // Otherwise stop attacking and wait for new webhook event. Condtions for attacking are:
  // - current army must be alive (squads != 0)
  // - there must be alive enemies
  // - current army cannot be in another attack
  attack() {
    if (this.enemies.length === 0 || this.attacking || this.squads === 0) {
      return;
    }
    const enemy = this.strategy(this.enemies);
    this.attacking = true;
    this.requests.attackRequest(this.serverURL, this.accessToken, enemy.id)
      .then(() => {
        this.attacking = false;
        this.attack();
      })
      .catch(() => {
        this.attacking = false;
      });
  }

  // Join this army to server. Server gives response with neccessary data for army and
  // army is started attacking enemies.
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

  // Return this army to server. If succeed, start to attack. Otherwise set army to not attack.
  return() {
    this.requests.returnRequest(this.serverURL, this.accessToken)
      .then((response) => {
        this.enemies = response.data.enemies;
        this.squads = response.data.squads;
        this.attack();
      }).catch(() => {
        this.squads = 0;
        this.enemies = [];
        this.attacking = false;
      });
  }

  // Leave this army from server. If succeed or not, army is set to not attack.
  leave() {
    this.requests.leaveRequest(this.serverURL, this.accessToken)
      .then(() => {
        this.squads = 0;
        this.enemies = [];
        this.attacking = false;
      })
      .catch(() => {
        this.squads = 0;
        this.enemies = [];
        this.attacking = false;
      });
  }
}

module.exports = Army;
