const buildCrudRoutes = require('./crudRoutesFactory');
const ratingController = require('../controllers/ratingController');

module.exports = buildCrudRoutes(ratingController);
