const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Publik - customer bisa booking tanpa login
router.post('/', bookingController.createBooking);

// Hanya Resepsionis
router.get('/queue', authMiddleware, roleCheck(['Receptionist']), bookingController.getQueue);
router.get('/today', authMiddleware, roleCheck(['Receptionist']), bookingController.getTodayBookings);
router.get('/', authMiddleware, roleCheck(['Receptionist']), bookingController.getAllBookings);
router.put('/:id/start', authMiddleware, roleCheck(['Receptionist']), bookingController.startBooking);
router.put('/:id/finish', authMiddleware, roleCheck(['Receptionist']), bookingController.finishBooking);

module.exports = router;