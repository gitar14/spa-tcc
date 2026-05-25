const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Get user's bookings
router.get('/:userId/bookings', paymentController.getUserBookings);

module.exports = router;