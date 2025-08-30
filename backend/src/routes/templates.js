const express = require('express');
const { body, validationResult } = require('express-validator');
const { createTemplate, getTemplates, updateTemplate, deleteTemplate } = require('../controllers/templateController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

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

const templateValidation = [
  body('name').notEmpty().withMessage('Template name is required'),
  body('type').isIn(['Educational', 'Professional', 'Government', 'Medical', 'Legal', 'Financial']).withMessage('Invalid template type'),
  body('fields').isArray({ min: 1 }).withMessage('At least one field is required')
];

// Create template
router.post('/', 
  authenticateToken,
  requireRole('issuer'),
  templateValidation,
  handleValidationErrors,
  createTemplate
);

// Get templates
router.get('/',
  authenticateToken,
  requireRole('issuer'),
  getTemplates
);

// Update template
router.put('/:id',
  authenticateToken,
  requireRole('issuer'),
  templateValidation,
  handleValidationErrors,
  updateTemplate
);

// Delete template
router.delete('/:id',
  authenticateToken,
  requireRole('issuer'),
  deleteTemplate
);

module.exports = router;