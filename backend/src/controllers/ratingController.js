const buildCrudController = require('./crudControllerFactory');
const ratingModel = require('../models/ratingModels');

module.exports = buildCrudController(ratingModel, 'Rating');
