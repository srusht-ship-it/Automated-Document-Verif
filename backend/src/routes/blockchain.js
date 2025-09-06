import express from 'express';
import blockchainService from '../services/blockchainService.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/blockchain/stats
 * Get blockchain statistics
 */
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const stats = blockchainService.getBlockchainStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain stats',
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/verify/:hash
 * Verify document exists on blockchain
 */
router.get('/verify/:hash', authenticateToken, (req, res) => {
  try {
    const { hash } = req.params;
    const verification = blockchainService.verifyDocumentOnBlockchain(hash);
    
    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Blockchain verification failed',
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/history/:documentId
 * Get verification history from blockchain
 */
router.get('/history/:documentId', authenticateToken, (req, res) => {
  try {
    const { documentId } = req.params;
    const history = blockchainService.getVerificationHistory(documentId);
    
    res.json({
      success: true,
      data: {
        documentId,
        verifications: history
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get verification history',
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/validate
 * Validate entire blockchain integrity
 */
router.get('/validate', authenticateToken, requireRole('verifier'), (req, res) => {
  try {
    const validation = blockchainService.validateBlockchain();
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Blockchain validation failed',
      error: error.message
    });
  }
});

export default router;