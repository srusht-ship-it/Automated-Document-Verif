const express = require('express');
const { upload, processBulkUpload, getBulkHistory } = require('../controllers/bulkController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Process bulk upload
router.post('/upload',
  authenticateToken,
  requireRole('issuer'),
  upload.single('csvFile'),
  processBulkUpload
);

// Get bulk upload history
router.get('/history',
  authenticateToken,
  requireRole('issuer'),
  getBulkHistory
);

module.exports = router;