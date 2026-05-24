const express = require('express');
const therapistController = require('../controllers/therapistController');

const router = express.Router();

router.get('/:id/status', therapistController.getStatus);
router.put('/:id/status', therapistController.setStatus);
router.get('/', therapistController.getAll);
router.get('/:id', therapistController.getById);
router.post('/', therapistController.create);
router.put('/:id', therapistController.update);
router.delete('/:id', therapistController.remove);

module.exports = router;
