const express = require('express');
const { body, validationResult, query } = require('express-validator');
const path = require('path');
const { 
  uploadDocument, 
  getDocuments, 
  getDocumentById, 
  updateDocumentStatus,
  getDocumentStats,
  getDocumentTypes,
  deleteDocument 
} = require('../controllers/documentController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { handleFileUpload, validateFileExists } = require('../middleware/upload');
const { validateFileUpload, protectFileAccess, sanitizePath } = require('../middleware/security');

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

// Document upload validation
const uploadValidation = [
  body('documentType')
    .notEmpty()
    .withMessage('Document type is required')
    .isIn(['birth_certificate', 'academic_transcript', 'experience_certificate', 'other'])
    .withMessage('Invalid document type'),
  body('recipientEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid recipient email is required when provided'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
];

// List documents validation
const listValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('status')
    .optional()
    .isIn(['pending', 'verified', 'rejected'])
    .withMessage('Invalid status filter'),
  query('documentType')
    .optional()
    .isString()
    .withMessage('Document type must be a string')
];

// Routes

/**
 * POST /api/documents/upload
 * Upload a new document (Issuer and Individual)
 */
router.post('/upload', 
  authenticateToken,
  requireRole(['issuer', 'individual']),
  handleFileUpload,
  validateFileUpload,
  validateFileExists,
  uploadValidation,
  handleValidationErrors,
  uploadDocument
);

/**
 * GET /api/documents/issued
 * Get issued documents (for issuers)
 */
router.get('/issued', authenticateToken, async (req, res) => {
  try {
    const { Document, User } = require('../models');
    const documents = await Document.findAll({
      where: { issuerId: req.user.id },
      include: [{
        model: User,
        as: 'individual',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch issued documents' });
  }
});

/**
 * GET /api/documents/received
 * Get received documents (for individuals)
 */
router.get('/received', authenticateToken, async (req, res) => {
  try {
    const { Document, User } = require('../models');
    const documents = await Document.findAll({
      where: { individualId: req.user.id },
      include: [{
        model: User,
        as: 'issuer',
        attributes: ['id', 'firstName', 'lastName', 'email', 'organization']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch received documents' });
  }
});

/**
 * GET /api/documents
 * Get documents list (filtered by user role)
 */
router.get('/',
  authenticateToken,
  listValidation,
  handleValidationErrors,
  getDocuments
);

/**
 * GET /api/documents/types
 * Get all document types and categories
 */
router.get('/types', getDocumentTypes);

/**
 * GET /api/documents/stats
 * Get document statistics for dashboard
 */
router.get('/stats',
  authenticateToken,
  getDocumentStats
);

/**
 * GET /api/documents/:id
 * Get specific document details
 */
router.get('/:id',
  authenticateToken,
  getDocumentById
);

/**
 * PUT /api/documents/:id/status
 * Update document status (verifiers and issuers)
 */
router.put('/:id/status',
  authenticateToken,
  requireRole(['verifier', 'issuer']),
  updateDocumentStatus
);

/**
 * DELETE /api/documents/:id
 * Delete document (Issuer only, own documents)
 */
router.delete('/:id',
  authenticateToken,
  requireRole('issuer'),
  deleteDocument
);

/**
 * GET /api/documents/:id/download
 * Download document file (with access control)
 */
router.get('/:id/download', 
  authenticateToken,
  requireRole(['issuer', 'individual', 'verifier']),
  async (req, res) => {
    try {
      const { Document, User } = require('../models');
      const { id } = req.params;
      const user = req.user;

      const document = await Document.findByPk(id);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Check access permissions
      const hasAccess = 
        user.role === 'verifier' ||
        document.issuerId === user.id ||
        document.individualId === user.id;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to download this document'
        });
      }

      // Validate and sanitize file path
      let sanitizedPath;
      try {
        sanitizedPath = sanitizePath(document.filePath);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file path'
        });
      }

      // Sanitize filename for download
      const sanitizedFilename = document.originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      // Set secure headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

      // Send file
      res.sendFile(sanitizedPath, (err) => {
        if (err) {
          console.error('File download error:', err);
          if (!res.headersSent) {
            res.status(404).json({
              success: false,
              message: 'File not found'
            });
          }
        }
      });

    } catch (error) {
      console.error('Download endpoint error:', error);
      res.status(500).json({
        success: false,
        message: 'Download failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * POST /api/documents/:id/verify
 * Verify document authenticity (Verifier only)
 */
router.post('/:id/verify',
  authenticateToken,
  requireRole('verifier'),
  async (req, res) => {
    try {
      const { Document } = require('../models');
      const { id } = req.params;
      const { verificationNotes } = req.body;

      const document = await Document.findByPk(id);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Simple verification logic (in real system, this would be more complex)
      const verificationResult = {
        isAuthentic: true, // This would be determined by AI/ML algorithms
        confidence: 85, // Confidence score
        verificationTime: new Date(),
        verifierId: req.user.id,
        notes: verificationNotes || ''
      };

      // Update document status
      await document.update({
        status: verificationResult.isAuthentic ? 'verified' : 'rejected',
        metadata: {
          ...document.metadata,
          verification: verificationResult
        }
      });

      res.status(200).json({
        success: true,
        message: 'Document verification completed',
        data: {
          verification: verificationResult,
          documentStatus: document.status
        }
      });

    } catch (error) {
      console.error('Document verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Verification failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;