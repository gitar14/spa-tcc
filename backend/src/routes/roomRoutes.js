const buildCrudRoutes = require('./crudRoutesFactory');
const roomController = require('../controllers/roomController');

module.exports = buildCrudRoutes(roomController);
