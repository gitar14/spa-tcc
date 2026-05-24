const buildCrudController = require('./crudControllerFactory');
const userModel = require('../models/userModels');

module.exports = buildCrudController(userModel, 'User');
