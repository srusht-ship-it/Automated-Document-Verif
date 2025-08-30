const { Document, User } = require('../models');
const { generateFileHash, deleteFile } = require('../middleware/upload');
const { extractText, analyzeDocumentText } = require('../utils/ocr');
const { sequelize } = require('../config/database');
const { suggestDocumentType, getDocumentTypeById, getAllDocumentTypes, getAllCategories } = require('../utils/documentTypes');
const path = require('path');

/**
 * Upload and process a new document
 */
const uploadDocument = async (req, res) => {
  try {
    const { documentType, recipientEmail, description } = req.body;
    const issuer = req.user;

    // Validate required fields
    if (!documentType) {
      if (req.fileInfo) {
        await deleteFile(req.fileInfo.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Document type is required'
      });
    }

    // Determine recipient based on user role and provided email
    let recipient;
    let actualIssuerId = issuer.id;
    
    if (issuer.role === 'individual' && !recipientEmail) {
      // Individual uploading for themselves - set issuer to null so it appears in verifier queue
      recipient = issuer;
      actualIssuerId = null;
    } else if (recipientEmail) {
      // Find specified recipient
      recipient = await User.findOne({ where: { email: recipientEmail } });
      if (!recipient) {
        await deleteFile(req.fileInfo.path);
        return res.status(404).json({
          success: false,
          message: 'Recipient user not found'
        });
      }
    } else {
      // Issuer must specify recipient email
      await deleteFile(req.fileInfo.path);
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required for issuers'
      });
    }

    // Generate file hash for uniqueness and integrity
    const fileHash = await generateFileHash(req.fileInfo.path);

    // Check if document with same hash already exists
    const existingDocument = await Document.findOne({ where: { hash: fileHash } });
    if (existingDocument) {
      await deleteFile(req.fileInfo.path);
      return res.status(409).json({
        success: false,
        message: 'Document with identical content already exists',
        existingDocumentId: existingDocument.id
      });
    }

    // Extract text from document
    console.log('Starting text extraction...');
    const ocrResult = await extractText(req.fileInfo.path, req.fileInfo.mimetype);
    
    // Analyze extracted text
    const textAnalysis = analyzeDocumentText(ocrResult.text);
    
    // Auto-suggest document type if not provided or invalid
    let finalDocumentType = documentType;
    if (!documentType || documentType === 'other') {
      finalDocumentType = suggestDocumentType(ocrResult.text);
    }
    
    const documentTypeInfo = getDocumentTypeById(finalDocumentType);

    // Create document record
    const document = await Document.create({
      filename: req.fileInfo.filename,
      originalName: req.fileInfo.originalName,
      filePath: req.fileInfo.path,
      hash: fileHash,
      issuerId: actualIssuerId,
      individualId: recipient.id,
      documentTypeId: null, // We'll add document types later
      status: 'pending',
      extractedText: ocrResult.text,
      metadata: {
        fileSize: req.fileInfo.size,
        mimeType: req.fileInfo.mimetype,
        uploadedAt: new Date().toISOString(),
        description: description || null,
        documentType: finalDocumentType,
        documentTypeInfo: documentTypeInfo,
        suggestedType: finalDocumentType !== documentType ? finalDocumentType : null,
        ocrResult: {
          confidence: ocrResult.confidence,
          wordCount: ocrResult.wordCount,
          success: ocrResult.success
        },
        textAnalysis: textAnalysis,
        issuerInfo: {
          name: `${issuer.firstName || ''} ${issuer.lastName || ''}`.trim() || 'Unknown',
          organization: issuer.organization
        },
        recipientInfo: {
          name: `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || 'Unknown',
          email: recipient.email
        }
      }
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Document uploaded and processed successfully',
      data: {
        document: {
          id: document.id,
          filename: document.filename,
          originalName: document.originalName,
          status: document.status,
          documentType: finalDocumentType,
          documentTypeInfo: documentTypeInfo,
          uploadedAt: document.createdAt,
          extractedTextPreview: ocrResult.text.substring(0, 200) + (ocrResult.text.length > 200 ? '...' : ''),
          ocrConfidence: ocrResult.confidence,
          textAnalysis: textAnalysis,
          issuer: {
            name: `${issuer.firstName || ''} ${issuer.lastName || ''}`.trim() || 'Unknown',
            organization: issuer.organization
          },
          recipient: {
            name: `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || 'Unknown',
            email: recipient.email
          }
        }
      }
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.fileInfo) {
      try {
        await deleteFile(req.fileInfo.path);
      } catch (cleanupError) {
        console.error('Failed to cleanup file:', cleanupError);
      }
    }

    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Document upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all documents for current user (based on role)
 */
const getDocuments = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 10, status, documentType } = req.query;

    const offset = (page - 1) * limit;
    const whereCondition = {};
    
    // Filter based on user role
    if (user.role === 'issuer') {
      whereCondition.issuerId = user.id;
    } else if (user.role === 'individual') {
      whereCondition.individualId = user.id;
    } else {
      // Verifiers can see all documents (in a real system, you might want to restrict this)
      // For now, let's show all documents for verifiers
    }

    // Apply additional filters
    if (status) {
      whereCondition.status = status;
    }

    // Find documents with pagination
    const { count, rows: documents } = await Document.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'issuer',
          attributes: ['id', 'firstName', 'lastName', 'organization', 'email']
        },
        {
          model: User,
          as: 'individual',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Format response
    const formattedDocuments = documents.map(doc => {
      const issuerName = doc.issuer ? 
        `${doc.issuer.firstName || ''} ${doc.issuer.lastName || ''}`.trim() || 'Unknown' : 
        'Unknown';
      
      const recipientName = doc.individual ? 
        `${doc.individual.firstName || ''} ${doc.individual.lastName || ''}`.trim() || 'Unknown' : 
        'Unknown';
      
      return {
        id: doc.id,
        filename: doc.filename,
        originalName: doc.originalName,
        status: doc.status,
        uploadedAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        documentType: doc.metadata?.documentType || 'unknown',
        extractedTextPreview: doc.extractedText ? doc.extractedText.substring(0, 150) + '...' : null,
        ocrConfidence: doc.metadata?.ocrResult?.confidence || 0,
        fileSize: doc.metadata?.fileSize || 0,
        mimeType: doc.metadata?.mimeType || 'unknown',
        issuer: {
          name: issuerName,
          organization: doc.issuer?.organization,
          email: doc.issuer?.email
        },
        recipient: {
          name: recipientName,
          email: doc.individual?.email
        }
      };
    });

    res.status(200).json({
      success: true,
      data: {
        documents: formattedDocuments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalDocuments: count,
          documentsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get single document details
 */
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const document = await Document.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'issuer',
          attributes: ['id', 'firstName', 'lastName', 'organization', 'email']
        },
        {
          model: User,
          as: 'individual',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access permissions
    const hasAccess = 
      user.role === 'verifier' || // Verifiers can access all documents
      document.issuerId === user.id || // Issuer can access their documents
      document.individualId === user.id; // Individual can access their documents

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this document'
      });
    }

    // Format detailed response
    const issuerName = document.issuer ? 
      `${document.issuer.firstName || ''} ${document.issuer.lastName || ''}`.trim() || 'Unknown' : 
      'Unknown';
    
    const recipientName = document.individual ? 
      `${document.individual.firstName || ''} ${document.individual.lastName || ''}`.trim() || 'Unknown' : 
      'Unknown';
    
    const documentDetails = {
      id: document.id,
      filename: document.filename,
      originalName: document.originalName,
      status: document.status,
      hash: document.hash,
      extractedText: document.extractedText,
      uploadedAt: document.createdAt,
      updatedAt: document.updatedAt,
      metadata: document.metadata,
      issuer: {
        id: document.issuer?.id,
        name: issuerName,
        organization: document.issuer?.organization,
        email: document.issuer?.email
      },
      recipient: {
        id: document.individual?.id,
        name: recipientName,
        email: document.individual?.email
      }
    };

    res.status(200).json({
      success: true,
      data: {
        document: documentDetails
      }
    });

  } catch (error) {
    console.error('Get document by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve document',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update document status
 */
const updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verificationNotes } = req.body;
    const user = req.user;

    // Validate status
    const validStatuses = ['pending', 'verified', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, verified, or rejected'
      });
    }

    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permissions - only verifiers and issuers can update status
    if (user.role !== 'verifier' && document.issuerId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only verifiers or document issuers can update status'
      });
    }

    // Update document
    const updatedMetadata = {
      ...document.metadata,
      statusHistory: [
        ...(document.metadata.statusHistory || []),
        {
          status: status,
          updatedBy: user.id,
          updatedAt: new Date().toISOString(),
          notes: verificationNotes || null,
          updatedByRole: user.role
        }
      ]
    };

    await document.update({
      status: status,
      metadata: updatedMetadata
    });

    res.status(200).json({
      success: true,
      message: 'Document status updated successfully',
      data: {
        documentId: document.id,
        newStatus: status,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Update document status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get document statistics for dashboard
 */
const getDocumentStats = async (req, res) => {
  try {
    const user = req.user;
    const whereCondition = {};
    
    // Filter based on user role
    if (user.role === 'issuer') {
      whereCondition.issuerId = user.id;
    } else if (user.role === 'individual') {
      whereCondition.individualId = user.id;
    }

    const stats = await Document.findAll({
      where: whereCondition,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Format stats
    const formattedStats = {
      total: 0,
      pending: 0,
      verified: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      formattedStats[stat.status] = parseInt(stat.count);
      formattedStats.total += parseInt(stat.count);
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve document statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all document types and categories
 */
const getDocumentTypes = async (req, res) => {
  try {
    const documentTypes = getAllDocumentTypes();
    const categories = getAllCategories();
    
    res.status(200).json({
      success: true,
      data: {
        documentTypes,
        categories
      }
    });
  } catch (error) {
    console.error('Get document types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve document types',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete document (only by issuer)
 */
const deleteDocument = async (req, res) => {
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

    // Only issuer can delete their documents
    if (document.issuerId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the document issuer can delete this document'
      });
    }

    // Delete file from filesystem
    try {
      await deleteFile(document.filePath);
    } catch (fileError) {
      console.warn('Failed to delete file from filesystem:', fileError);
    }

    // Delete from database
    await document.destroy();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocumentStatus,
  getDocumentStats,
  getDocumentTypes,
  deleteDocument
};