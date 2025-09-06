import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  verifyDocument,
  getVerificationHistory,
  bulkVerifyDocuments,
  getVerificationStats
} from '../controllers/verificationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Verification validation rules
const verificationValidation = [
  body('verificationNotes')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Verification notes must be less than 1000 characters'),
  body('forceReVerify')
    .optional()
    .isBoolean()
    .withMessage('forceReVerify must be a boolean')
];

// Bulk verification validation
const bulkVerificationValidation = [
  body('documentIds')
    .isArray({ min: 1, max: 50 })
    .withMessage('documentIds must be an array with 1-50 items'),
  body('documentIds.*')
    .isInt({ min: 1 })
    .withMessage('Each document ID must be a positive integer'),
  body('verificationNotes')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Verification notes must be less than 1000 characters')
];

/**
 * POST /api/verification/:id
 * Verify a specific document using AI/ML algorithms
 */
router.post('/:id',
  authenticateToken,
  requireRole('verifier'),
  verificationValidation,
  handleValidationErrors,
  verifyDocument
);

/**
 * GET /api/verification/:id/history
 * Get verification history for a document
 */
router.get('/:id/history',
  authenticateToken,
  getVerificationHistory
);

/**
 * POST /api/verification/bulk
 * Bulk verify multiple documents
 */
router.post('/bulk',
  authenticateToken,
  requireRole('verifier'),
  bulkVerificationValidation,
  handleValidationErrors,
  bulkVerifyDocuments
);

/**
 * GET /api/verification/stats
 * Get verification statistics (verifiers only)
 */
router.get('/stats',
  authenticateToken,
  requireRole('verifier'),
  getVerificationStats
);

export default router;