const express = require('express');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get('/queue', bookingController.getQueue);
router.get('/slots/check', bookingController.getAvailableSlot);
router.get('/notifications/:userId', bookingController.getNotifications);
router.get('/preferences/:userId', bookingController.getPreference);
router.put('/:id/finish', bookingController.finish);
router.get('/', bookingController.getAll);
router.get('/:id', bookingController.getById);
router.post('/', bookingController.create);
router.put('/:id', bookingController.update);
router.delete('/:id', bookingController.remove);

module.exports = router;
