const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Document, User, Template } = require('../models');

// Issue document to individual
router.post('/issue', auth, async (req, res) => {
  try {
    const { templateId, individualEmail, documentData } = req.body;
    const issuerId = req.user.id;

    const individual = await User.findOne({ where: { email: individualEmail } });
    if (!individual) {
      return res.status(404).json({
        success: false,
        message: 'Individual not found'
      });
    }

    const document = await Document.create({
      filename: documentData.filename || `${documentData.type}_${Date.now()}.pdf`,
      originalName: documentData.originalName || documentData.name,
      filePath: documentData.filePath || `/generated/${Date.now()}.pdf`,
      hash: require('crypto').randomBytes(32).toString('hex'),
      issuerId,
      individualId: individual.id,
      documentTypeId: documentData.documentTypeId || 1,
      status: 'pending',
      metadata: {
        templateId,
        documentData,
        issuedAt: new Date(),
        issuerName: req.user.firstName + ' ' + req.user.lastName
      }
    });

    res.status(201).json({
      success: true,
      message: 'Document issued successfully',
      data: document
    });
  } catch (error) {
    console.error('Issue document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to issue document'
    });
  }
});

// Get issued documents
router.get('/issued', auth, async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { issuerId: req.user.id },
      include: [
        {
          model: User,
          as: 'individual',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Get issued documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issued documents'
    });
  }
});

// Get received documents
router.get('/received', auth, async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { individualId: req.user.id },
      include: [
        {
          model: User,
          as: 'issuer',
          attributes: ['id', 'firstName', 'lastName', 'email', 'organization']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Get received documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch received documents'
    });
  }
});

// Request verification
router.post('/:documentId/request-verification', auth, async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findOne({
      where: { id: documentId, individualId: req.user.id }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    await document.update({
      status: 'pending',
      metadata: {
        ...document.metadata,
        verificationRequested: true,
        verificationRequestedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Verification requested successfully',
      data: document
    });
  } catch (error) {
    console.error('Request verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request verification'
    });
  }
});

module.exports = router;