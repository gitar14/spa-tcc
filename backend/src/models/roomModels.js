const { Room } = require('../schema');
const buildCrudModel = require('./crudFactory');

module.exports = buildCrudModel(Room);
