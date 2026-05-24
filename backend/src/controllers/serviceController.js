const buildCrudController = require('./crudControllerFactory');
const serviceModel = require('../models/serviceModels');

module.exports = buildCrudController(serviceModel, 'Layanan');
