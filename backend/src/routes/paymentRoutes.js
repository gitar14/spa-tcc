const buildCrudRoutes = require('./crudRoutesFactory');
const paymentController = require('../controllers/paymentController');

module.exports = buildCrudRoutes(paymentController);
