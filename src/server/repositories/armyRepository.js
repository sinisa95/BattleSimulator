const Army = require('../models/army');

/**
 * Find all armies that meet all conditions.
 * @param {Object} conditions
 * @returns {Promise<Army[]>} Promise for array of armies
 */
const find = (conditions) => Army.find(conditions);

/**
 * Find one army that meet all conditions.
 * @param {Object} conditions
 * @returns {Promise<Army>} Promise for army
 */
const findOne = (conditions) => Army.findOne(conditions);

/**
 * Find one army with specified id.
 * @param {string} id
 * @returns {Promise<Army>} Promise for army
 */
const findById = (id) => Army.findById(id);

/**
 * Find one army that meet all conditions and update with defined properties.
 * @param {Object} conditions
 * @param {Object} armyUpdate
 * @param {Object} options
 * @returns {Promise<Army>} Promise for army
 */
const findOneAndUpdate = (conditions, armyUpdate, options) => (
  Army.findOneAndUpdate(conditions, armyUpdate, options)
);

/**
 * Save a new army
 * @param {Object} army
 * @returns {Promise<Army>} Promise for created army
 */
const save = (army) => new Army(army).save();

/**
 * Update with defined properties.
 * @param {*} army
 * @param {*} armyUpdate
 * @returns {Promise<Army>} Promise for updated army
 */
const update = (army, armyUpdate) => Army.updateOne(army, armyUpdate);

module.exports = {
  find,
  findOne,
  findById,
  findOneAndUpdate,
  save,
  update,
  afterDeadEvent: Army.afterDeadEvent,
};
