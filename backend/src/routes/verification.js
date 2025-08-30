const express = require('express');
const { getVerificationQueue, verifyDocumentById, getVerificationHistory, quickVerify } = require('../controllers/verificationController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { handleFileUpload } = require('../middleware/upload');

const router = express.Router();

// Get verification queue
router.get('/queue',
  authenticateToken,
  requireRole('verifier'),
  getVerificationQueue
);

// Verify document by ID
router.put('/:id/verify',
  authenticateToken,
  requireRole('verifier'),
  verifyDocumentById
);

// Get verification history
router.get('/history',
  authenticateToken,
  requireRole('verifier'),
  getVerificationHistory
);

// Quick verify uploaded document
router.post('/quick-verify',
  authenticateToken,
  requireRole('verifier'),
  handleFileUpload,
  quickVerify
);

module.exports = router;