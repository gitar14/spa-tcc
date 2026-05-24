const { Service } = require('../schema');
const buildCrudModel = require('./crudFactory');

module.exports = buildCrudModel(Service);
