const chalk = require('chalk');

const clientLog = false;

exports.serverLog = (messagge) => clientLog && console.log(`${chalk.blue('SERVER')} -> ${messagge}`);

exports.serverJoinLog = (army, returned) => this.serverLog(
  `${chalk.green(!returned ? 'JOIN' : 'RETURN')} 
  armyId: ${chalk.cyanBright(army.id)} 
  name: ${chalk.cyanBright(army.name)} 
  squads: ${chalk.yellow(army.squads)}`,
);

exports.serverLeaveLog = (army) => this.serverLog(
  `${chalk.red('LEAVE')} 
  armyId: ${chalk.cyanBright(army.id)} 
  name: ${chalk.cyanBright(army.name)} 
  squads: ${chalk.yellow(army.squads)}`,
);

exports.clientLog = (client, messagge) => clientLog
  && console.log(`${chalk.blue(`ARMY ${client.name} (${client.id})`)} -> ${messagge}`);

exports.clientLeaveEventLog = (client, army) => this.clientLog(
  client,
  `${chalk.red('LEAVE')} 
  armyId: ${chalk.cyanBright(army.id)}  
  leaveType: ${chalk.cyanBright(army.leaveType)}`,
);

exports.clientUpdateEventLog = (client, update) => this.clientLog(
  client,
  `${chalk.magenta('ATTACK')} 
  attackerId: ${chalk.cyanBright(update.attackerId)}  
  attackedId: ${chalk.cyanBright(update.attackedId)}
  attackedSquads: ${chalk.yellow(update.attackedSquads)}`,
);

exports.clientArmyLog = (client, army) => this.clientLog(
  client,
  `${chalk.green('JOIN')} 
  armyId: ${chalk.cyanBright(army.id)}  
  name: ${chalk.cyanBright(army.name)}  
  squads: ${chalk.yellow(army.squads)}`,
);
