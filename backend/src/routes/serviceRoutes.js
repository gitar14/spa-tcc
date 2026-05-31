const express = require('express');
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Publik - semua bisa lihat katalog
router.get('/', serviceController.getAll);
router.get('/:id', serviceController.getById);

// Hanya Resepsionis
router.post('/', authMiddleware, roleCheck(['Receptionist']), serviceController.create);
router.put('/:id', authMiddleware, roleCheck(['Receptionist']), serviceController.update);
router.delete('/:id', authMiddleware, roleCheck(['Receptionist']), serviceController.remove);

module.exports = router;