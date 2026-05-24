const buildCrudController = require('./crudControllerFactory');
const paymentModel = require('../models/paymentModels');

module.exports = buildCrudController(paymentModel, 'Pembayaran');
