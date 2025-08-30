const { Document, User } = require('../models');

// Get verification queue for verifier
const getVerificationQueue = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const documents = await Document.findAll({
      where: { 
        status: 'pending',
        individualId: { [Op.ne]: null }
      },
      include: [
        { 
          model: User, 
          as: 'issuer', 
          attributes: ['id', 'email', 'firstName', 'lastName'],
          required: false
        },
        { 
          model: User, 
          as: 'individual', 
          attributes: ['id', 'email', 'firstName', 'lastName'],
          required: true
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Get verification queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verification queue'
    });
  }
};

// Verify document by ID
const verifyDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const document = await Document.findByPk(id, {
      include: [
        { model: User, as: 'issuer', attributes: ['email', 'firstName', 'lastName'] },
        { model: User, as: 'individual', attributes: ['email', 'firstName', 'lastName'] }
      ]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update document with verification result
    await document.update({
      status,
      metadata: {
        ...document.metadata,
        verification: {
          verifierId: req.user.id,
          verificationDate: new Date(),
          notes: notes || '',
          confidence: Math.round(Math.random() * 20 + 80) // Mock confidence score
        }
      }
    });

    res.json({
      success: true,
      message: 'Document verification completed',
      data: document
    });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
};

// Get verification history for verifier
const getVerificationHistory = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const documents = await Document.findAll({
      where: {
        status: { [Op.in]: ['verified', 'rejected'] }
      },
      include: [
        { model: User, as: 'issuer', attributes: ['email', 'firstName', 'lastName'] },
        { model: User, as: 'individual', attributes: ['email', 'firstName', 'lastName'] }
      ],
      order: [['updatedAt', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Get verification history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verification history'
    });
  }
};

// Quick verify by document upload
const quickVerify = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Document file is required'
      });
    }

    // Mock AI verification result
    const verificationResult = {
      status: Math.random() > 0.3 ? 'verified' : 'flagged',
      confidence: Math.round((Math.random() * 40 + 60) * 10) / 10,
      documentType: 'Unknown',
      aiAnalysis: {
        textAccuracy: Math.round(Math.random() * 20 + 80),
        formatIntegrity: Math.round(Math.random() * 15 + 85),
        securityFeatures: Math.round(Math.random() * 25 + 75)
      },
      verificationDate: new Date(),
      verifierId: req.user.id
    };

    res.json({
      success: true,
      message: 'Document verification completed',
      data: verificationResult
    });
  } catch (error) {
    console.error('Quick verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Quick verification failed'
    });
  }
};

module.exports = {
  getVerificationQueue,
  verifyDocumentById,
  getVerificationHistory,
  quickVerify
};