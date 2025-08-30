const express = require('express');
const { getIssuerAnalytics, getVerifierAnalytics } = require('../controllers/analyticsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get issuer analytics
router.get('/issuer',
  authenticateToken,
  requireRole('issuer'),
  getIssuerAnalytics
);

// Get verifier analytics
router.get('/verifier',
  authenticateToken,
  requireRole('verifier'),
  getVerifierAnalytics
);

module.exports = router;