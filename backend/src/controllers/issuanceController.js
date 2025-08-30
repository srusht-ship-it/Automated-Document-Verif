const { Document, User, Template } = require('../models');
const { Op } = require('sequelize');

// Issue document to individual
const issueDocument = async (req, res) => {
  try {
    const { templateId, individualEmail, documentData } = req.body;
    const issuerId = req.user.id;

    // Find individual user
    const individual = await User.findOne({ where: { email: individualEmail } });
    if (!individual) {
      return res.status(404).json({
        success: false,
        message: 'Individual not found'
      });
    }

    // Find template if provided
    let template = null;
    if (templateId) {
      template = await Template.findOne({ 
        where: { id: templateId, issuerId } 
      });
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }
    }

    // Create document
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

    // Update template usage
    if (template) {
      await template.increment('usage');
    }

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
};

// Get issued documents for issuer
const getIssuedDocuments = async (req, res) => {
  try {
    const issuerId = req.user.id;
    
    const documents = await Document.findAll({
      where: { issuerId },
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
};

// Get received documents for individual
const getReceivedDocuments = async (req, res) => {
  try {
    const individualId = req.user.id;
    
    const documents = await Document.findAll({
      where: { individualId },
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
};

// Request verification for document
const requestVerification = async (req, res) => {
  try {
    const { documentId } = req.params;
    const individualId = req.user.id;

    const document = await Document.findOne({
      where: { id: documentId, individualId }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update document to request verification
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
};

module.exports = {
  issueDocument,
  getIssuedDocuments,
  getReceivedDocuments,
  requestVerification
};