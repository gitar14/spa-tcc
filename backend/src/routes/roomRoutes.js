const express = require('express');
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Publik
router.get('/', roomController.getAll);
router.get('/:id', roomController.getById);

// Hanya Resepsionis
router.post('/', authMiddleware, roleCheck(['Receptionist']), roomController.create);
router.put('/:id', authMiddleware, roleCheck(['Receptionist']), roomController.update);
router.delete('/:id', authMiddleware, roleCheck(['Receptionist']), roomController.remove);

module.exports = router;