const Army = require('../models/army');

const find = (conditions) => Army.find(conditions);

const findOne = (conditions) => Army.findOne(conditions);

const findById = (id) => Army.findById(id);

const findOneAndUpdate = (conditions, update, opts) => Army.findOneAndUpdate(
  conditions, update, opts,
);

const save = (army) => new Army(army).save();

const update = (army, armyUpdate) => Army.findByIdAndUpdate(army.id, armyUpdate);

module.exports = {
  find,
  findOne,
  findById,
  findOneAndUpdate,
  save,
  update,
};
