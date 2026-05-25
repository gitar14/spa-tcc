const express = require('express');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// Queue endpoint
router.get('/queue', bookingController.getQueue);

// CRUD endpoints
router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);
router.put('/:id/finish', bookingController.finishBooking);
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;