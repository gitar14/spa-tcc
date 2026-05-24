const express = require('express');
const userRoutes = require('./userRoutes');
const therapistRoutes = require('./therapistRoutes');
const serviceRoutes = require('./serviceRoutes');
const roomRoutes = require('./roomRoutes');
const bookingRoutes = require('./bookingRoutes');
const paymentRoutes = require('./paymentRoutes');
const ratingRoutes = require('./ratingRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ service: 'spa-backend', status: 'ok' });
});
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/therapists', therapistRoutes);
router.use('/services', serviceRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/ratings', ratingRoutes);

module.exports = router;
