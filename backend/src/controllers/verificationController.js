import { Document, User } from '../models/index.js';
import verificationService from '../services/verificationService.js';

/**
 * Verify document authenticity using AI/ML algorithms
 */
export const verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationNotes, forceReVerify = false } = req.body;
    const verifier = req.user;

    // Find the document
    const document = await Document.findByPk(id, {
      include: [
        { model: User, as: 'issuer', attributes: ['id', 'firstName', 'lastName', 'organization'] },
        { model: User, as: 'individual', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if already verified and not forcing re-verification
    if (document.status === 'verified' && !forceReVerify) {
      return res.status(400).json({
        success: false,
        message: 'Document already verified. Use forceReVerify=true to re-verify.'
      });
    }

    // Run AI/ML verification
    const verificationResult = await verificationService.verifyDocument(
      document.filePath,
      document.metadata?.documentType || 'other',
      document.metadata
    );

    // Create comprehensive verification record
    const fullVerificationResult = {
      ...verificationResult,
      verifierId: verifier.id,
      verifierName: verifier.getFullName(),
      verificationNotes: verificationNotes || '',
      documentId: document.id,
      verificationTime: new Date()
    };

    // Update document with verification results
    const newStatus = verificationResult.isAuthentic ? 'verified' : 'rejected';
    await document.update({
      status: newStatus,
      metadata: {
        ...document.metadata,
        verification: fullVerificationResult,
        lastVerified: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: `Document ${newStatus} successfully`,
      data: {
        document: {
          id: document.id,
          status: newStatus,
          originalName: document.originalName
        },
        verification: fullVerificationResult
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
};

/**
 * Get verification history for a document
 */
export const getVerificationHistory = async (req, res) => {
  try {
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
        message: 'Access denied'
      });
    }

    const verificationHistory = document.metadata?.verification || null;

    res.status(200).json({
      success: true,
      data: {
        documentId: document.id,
        currentStatus: document.status,
        verification: verificationHistory
      }
    });

  } catch (error) {
    console.error('Get verification history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Bulk verify multiple documents
 */
export const bulkVerifyDocuments = async (req, res) => {
  try {
    const { documentIds, verificationNotes } = req.body;
    const verifier = req.user;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Document IDs array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const documentId of documentIds) {
      try {
        const document = await Document.findByPk(documentId);
        
        if (!document) {
          errors.push({ documentId, error: 'Document not found' });
          continue;
        }

        // Run verification
        const verificationResult = await verificationService.verifyDocument(
          document.filePath,
          document.metadata?.documentType || 'other',
          document.metadata
        );

        const fullResult = {
          ...verificationResult,
          verifierId: verifier.id,
          verifierName: verifier.getFullName(),
          verificationNotes: verificationNotes || '',
          documentId: document.id,
          verificationTime: new Date()
        };

        // Update document
        const newStatus = verificationResult.isAuthentic ? 'verified' : 'rejected';
        await document.update({
          status: newStatus,
          metadata: {
            ...document.metadata,
            verification: fullResult
          }
        });

        results.push({
          documentId: document.id,
          status: newStatus,
          confidence: verificationResult.confidence,
          isAuthentic: verificationResult.isAuthentic
        });

      } catch (error) {
        errors.push({ documentId, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk verification completed. ${results.length} successful, ${errors.length} failed.`,
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: documentIds.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error('Bulk verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get verification statistics
 */
export const getVerificationStats = async (req, res) => {
  try {
    const user = req.user;

    // Only verifiers can access stats
    if (user.role !== 'verifier') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Verifier role required.'
      });
    }

    // Get verification statistics
    const totalDocuments = await Document.count();
    const verifiedDocuments = await Document.count({ where: { status: 'verified' } });
    const rejectedDocuments = await Document.count({ where: { status: 'rejected' } });
    const pendingDocuments = await Document.count({ where: { status: 'pending' } });

    // Get documents verified by this verifier
    const myVerifications = await Document.count({
      where: {
        status: ['verified', 'rejected'],
        metadata: {
          verification: {
            verifierId: user.id
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total: totalDocuments,
          verified: verifiedDocuments,
          rejected: rejectedDocuments,
          pending: pendingDocuments,
          verificationRate: totalDocuments > 0 ? ((verifiedDocuments + rejectedDocuments) / totalDocuments * 100).toFixed(1) : 0
        },
        myActivity: {
          documentsVerified: myVerifications,
          verifierId: user.id,
          verifierName: user.getFullName()
        }
      }
    });

  } catch (error) {
    console.error('Get verification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};