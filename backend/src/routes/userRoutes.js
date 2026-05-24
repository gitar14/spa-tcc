const buildCrudRoutes = require('./crudRoutesFactory');
const userController = require('../controllers/userController');

module.exports = buildCrudRoutes(userController);
