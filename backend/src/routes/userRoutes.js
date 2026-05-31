const express = require('express');
const userController = require('../controllers/userController');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.use(authMiddleware); // semua endpoint di bawah wajib login

router.get('/', roleCheck(['Receptionist']), userController.getAll);
router.get('/:id', roleCheck(['Receptionist']), userController.getById);
router.post('/', roleCheck(['Receptionist']), userController.create);
router.put('/:id', roleCheck(['Receptionist']), userController.update);
router.delete('/:id', roleCheck(['Receptionist']), userController.remove);

router.get('/:userId/bookings', paymentController.getUserBookings);

module.exports = router;