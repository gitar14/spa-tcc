const { Rating } = require('../schema');
const buildCrudModel = require('./crudFactory');

module.exports = buildCrudModel(Rating);
