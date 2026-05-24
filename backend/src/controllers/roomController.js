const buildCrudController = require('./crudControllerFactory');
const roomModel = require('../models/roomModels');

module.exports = buildCrudController(roomModel, 'Ruangan');
