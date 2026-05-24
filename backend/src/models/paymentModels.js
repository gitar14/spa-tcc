const { Payment } = require('../schema');
const buildCrudModel = require('./crudFactory');

module.exports = buildCrudModel(Payment);
