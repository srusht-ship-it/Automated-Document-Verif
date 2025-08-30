const express = require('express');
const { body, validationResult } = require('express-validator');
const { getUserProfile, updateUserProfile, changePassword } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

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

/**
 * GET /api/users/profile
 * Get current user profile
 */
router.get('/profile', authenticateToken, getUserProfile);

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile',
  authenticateToken,
  [
    body('firstName').optional().isString().trim().isLength({ min: 1, max: 50 }),
    body('lastName').optional().isString().trim().isLength({ min: 1, max: 50 }),
    body('organization').optional().isString().trim().isLength({ max: 100 })
  ],
  handleValidationErrors,
  updateUserProfile
);

/**
 * PUT /api/users/change-password
 * Change user password
 */
router.put('/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  handleValidationErrors,
  changePassword
);

module.exports = router;