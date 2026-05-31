const express = require('express');
const therapistController = require('../controllers/therapistController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Publik - semua bisa lihat (untuk mobile booking)
router.get('/', therapistController.getAll);
router.get('/:id', therapistController.getById);
router.get('/:id/status', therapistController.getStatus);

// Hanya Resepsionis
router.put('/:id/status', authMiddleware, roleCheck(['Receptionist']), therapistController.setStatus);
router.post('/', authMiddleware, roleCheck(['Receptionist']), therapistController.create);
router.put('/:id', authMiddleware, roleCheck(['Receptionist']), therapistController.update);
router.delete('/:id', authMiddleware, roleCheck(['Receptionist']), therapistController.remove);

module.exports = router;