const chalk = require('chalk');

const SERVER_LOG = process.env.SERVER_LOG === 'true';
const CLIENT_LOG = process.env.CLIENT_LOG === 'true';

const serverLog = (messagge) => SERVER_LOG && console.log(`${chalk.blue('SERVER')} -> ${messagge}`);

const serverJoinLog = (army, returned) => {
  const messagge = `${chalk.green(!returned ? 'JOIN' : 'RETURN')} 
    armyId: ${chalk.cyanBright(army.id)} 
    name: ${chalk.cyanBright(army.name)} 
    squads: ${chalk.yellow(army.squads)}`;
  serverLog(messagge);
};

const serverLeaveLog = (army) => {
  const messagge = `${chalk.red('LEAVE')} 
    armyId: ${chalk.cyanBright(army.id)} 
    name: ${chalk.cyanBright(army.name)} 
    squads: ${chalk.yellow(army.squads)}`;
  serverLog(messagge);
};

const serverAttackLog = (attacker, attacked, damage) => {
  const messagge = `${chalk.magenta('ATTACK')} 
    ${chalk.green(attacker.name)} => ${chalk.red(attacked.name)} 
    damage: ${chalk.yellow(damage)}`;
  serverLog(messagge);
};

const clientLog = (client, messagge) => CLIENT_LOG
  && console.log(`${chalk.blue(`ARMY ${client.name} (${client.id})`)} -> ${messagge}`);

const clientLeaveEventLog = (client, army) => {
  const messagge = `${chalk.red('LEAVE')} 
  armyId: ${chalk.cyanBright(army.id)}  
  leaveType: ${chalk.cyanBright(army.leaveType)}`;
  clientLog(client, messagge);
};

const clientUpdateEventLog = (client, update) => {
  const messagge = `${chalk.magenta('ATTACK')} 
    attackerId: ${chalk.cyanBright(update.attackerId)}  
    attackedId: ${chalk.cyanBright(update.attackedId)}
    attackedSquads: ${chalk.yellow(update.attackedSquads)}`;
  clientLog(client, messagge);
};

const clientArmyLog = (client, army) => {
  const messagge = `${chalk.green('JOIN')} 
    armyId: ${chalk.cyanBright(army.id)}  
    name: ${chalk.cyanBright(army.name)}  
    squads: ${chalk.yellow(army.squads)}`;
  clientLog(client, messagge);
};

module.exports = {
  serverLog,
  serverJoinLog,
  serverLeaveLog,
  serverAttackLog,
  clientLog,
  clientLeaveEventLog,
  clientUpdateEventLog,
  clientArmyLog,
};
