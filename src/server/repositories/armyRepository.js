const Army = require('../models/army');

exports.find = (conditions) => Army.find(conditions);

exports.findOne = (conditions) => Army.findOne(conditions);

exports.findById = (id) => Army.findById(id);

exports.findOneAndUpdate = (conidtions, update) => Army.findOneAndUpdate(conidtions, update);

exports.save = (army) => new Army(army).save();

exports.update = (army, update) => Army.findByIdAndUpdate(army.id, update);
