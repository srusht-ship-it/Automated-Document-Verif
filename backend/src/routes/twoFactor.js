import express from 'express';
import { body, validationResult } from 'express-validator';
import twoFactorService from '../services/twoFactorService.js';
import auditService from '../services/auditService.js';
import { authenticateToken } from '../middleware/auth.js';

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

/**
 * POST /api/2fa/send-otp
 * Send OTP to user's email
 */
router.post('/send-otp', 
  authenticateToken,
  [
    body('email').isEmail().withMessage('Valid email required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email } = req.body;
      const result = await twoFactorService.sendOTP(email, req.user.id);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/2fa/verify-otp
 * Verify OTP code
 */
router.post('/verify-otp',
  authenticateToken,
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, otp } = req.body;
      const result = await twoFactorService.verifyOTP(email, otp, req.user.id);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to verify OTP',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/2fa/enable
 * Enable 2FA for user
 */
router.post('/enable',
  authenticateToken,
  async (req, res) => {
    try {
      const result = await twoFactorService.enable2FA(req.user.id, req.user.email);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to enable 2FA',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/2fa/disable
 * Disable 2FA for user
 */
router.post('/disable',
  authenticateToken,
  async (req, res) => {
    try {
      const result = await twoFactorService.disable2FA(req.user.id, req.user.email);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to disable 2FA',
        error: error.message
      });
    }
  }
);

export default router;