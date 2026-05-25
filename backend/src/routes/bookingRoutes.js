const express = require('express');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get('/queue', bookingController.getQueue);
router.get('/today', bookingController.getTodayBookings);
router.put('/:id/start', bookingController.startBooking);
router.put('/:id/finish', bookingController.finishBooking);
router.get('/', bookingController.getAllBookings);
router.post('/', bookingController.createBooking);

module.exports = router;
