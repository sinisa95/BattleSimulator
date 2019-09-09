const chalk = require('chalk');

exports.serverLog = (messagge) => console.log(`${chalk.blue('SERVER')} -> ${messagge}`);

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

exports.clientLog = (client, messagge) => console.log(`${chalk.blue(`ARMY ${client.name} (${client.id})`)} -> ${messagge}`);
/* [client, messagge]; */

exports.clientEventLog = (client, event) => this.clientLog(
  client,
  `${chalk.green(event.eventType.toUpperCase())} 
  armyId: ${chalk.cyanBright(event.data.armyId)}  
  squads: ${chalk.yellow(event.data.squads)}`,
);

exports.clientArmyLog = (client, army) => this.clientLog(
  client,
  `${chalk.green('JOIN')} 
  armyId: ${chalk.cyanBright(army.id)}  
  name: ${chalk.cyanBright(army.name)}  
  squads: ${chalk.yellow(army.squads)}`,
);
