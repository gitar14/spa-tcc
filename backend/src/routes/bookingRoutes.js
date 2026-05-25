kconst express = require('express');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// Queue & utilities
router.get('/queue', bookingController.getQueue);
router.get('/today', bookingController.getTodayBookings);

// Workflow
router.put('/:id/start', bookingController.startBooking);
router.put('/:id/finish', bookingController.finishBooking);

// CRUD
router.get('/', bookingController.getAllBookings);
router.post('/', bookingController.createBooking);

module.exports = router;
