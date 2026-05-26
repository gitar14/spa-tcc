const express = require('express');
const multer = require('multer');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common image mimetypes
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/jpg',
      'image/webp',
      'application/octet-stream' // For mobile uploads that don't set mimetype
    ];
    
    // Also check filename extension as fallback
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const hasValidExt = allowedExts.some(ext => 
      file.originalname.toLowerCase().endsWith(ext)
    );
    
    if (allowedTypes.includes(file.mimetype) || hasValidExt) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG, and WebP images are allowed'));
    }
  }
});

// Upload payment proof
router.post('/:bookingId/proof', upload.single('payment_proof'), paymentController.uploadPaymentProof);

module.exports = router;

