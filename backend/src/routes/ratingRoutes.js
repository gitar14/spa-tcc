const express = require('express');
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Publik - semua bisa lihat dan beri rating
router.get('/', ratingController.getAll);
router.get('/:id', ratingController.getById);
router.post('/', ratingController.create);

// Hanya Resepsionis
router.put('/:id', authMiddleware, roleCheck(['Receptionist']), ratingController.update);
router.delete('/:id', authMiddleware, roleCheck(['Receptionist']), ratingController.remove);

module.exports = router;