const buildCrudRoutes = require('./crudRoutesFactory');
const serviceController = require('../controllers/serviceController');

module.exports = buildCrudRoutes(serviceController);
