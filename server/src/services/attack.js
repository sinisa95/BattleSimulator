const Army = require('../models/army');
const States = require('../models/enums/state');
const { NotFoundError } = require('restify-errors');

const attackChance = squads => 1 / squads;

const halfDamageChance = squads => Math.abs(squads - 100) / 100;

const probabilityHit = chance => Math.random() < chance;

const takeDamage = (squads, attackNumber) => Math.floor(squads / attackNumber);

const reload = () =>  new Promise(resolve => setTimeout(resolve, 1000));

const repeatAttack = async squads => {
    const chance = attackChance(squads);
    for(let i = 0; i < squads; i++){
        if( probabilityHit(chance) ){
            return takeDamage(squads, i + 1);
        }
        if( (i % 10 - 9)  === 0 ){
            console.log('sleep');
            await reload();
        }
    }
}

const receiveDamage = (squads, damage) => {
    const chance = halfDamageChance(squads)
    return probabilityHit(chance) ? Math.floor(damage/2) : damage;
} 

const calculateDamage = async (attacker, attacked) => {
    const damage = await repeatAttack(attacker.squads);
    console.log("Damage:" + damage);
    if(damage)
        return receiveDamage(attacked.squads, damage);
}

const attack = (accessToken, armyId) => {
    return Promise.all([
        Army.findOne({accessToken}), 
        Army.findById(armyId)
    ]).then( ([attacker, attacked]) => {  
        if(!attacker && !attacked)
            return Promise.reject(new NotFoundError()); 
        return Promise.all([attacked, calculateDamage(attacker, attacked)]);
    }).then( ([attacked, damage]) =>{
        if(!damage){
            return Promise.resolve();      
        }
        if(attacked.squads <= damage){
            attacked.squads = 0;
            attacked.state = States.Dead;
        }else{
            attacked.squads -= damage; 
        }
        return attacked.save();
    }).catch(err => Promise.reject(new NotFoundError(err)));
}

module.exports = (req, res, next) => {
    attack(req.query.accessToken, req.params.armyId)
        .then(() => {
            res.json();
            next();
        })
        .catch(err => {
            next(err);
        });
}