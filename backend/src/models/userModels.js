const { User } = require('../schema');
const buildCrudModel = require('./crudFactory');

module.exports = buildCrudModel(User);
