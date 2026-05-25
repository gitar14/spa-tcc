const express = require('express');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// Queue endpoint
router.get('/queue', bookingController.getQueue);

// TODAY BOOKINGS - Tambah ini (NEW)
router.get('/today', bookingController.getTodayBookings);

// CRUD endpoints
router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);

// START BOOKING - Tambah ini (NEW)
router.put('/:id/start', bookingController.startBooking);

router.put('/:id/finish', bookingController.finishBooking);
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;