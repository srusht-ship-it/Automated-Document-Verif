const { Document, User } = require('../models');
const { generateFileHash, deleteFile } = require('../middleware/upload');
const { extractText, analyzeDocumentText } = require('../utils/ocr');
const path = require('path');

/**
 * Upload and process a new document
 */
const uploadDocument = async (req, res) => {
  try {
    const { documentType, recipientEmail, description } = req.body;
    const issuer = req.user;

    // Validate required fields
    if (!documentType || !recipientEmail) {
      // Clean up uploaded file if validation fails
      if (req.fileInfo) {
        await deleteFile(req.fileInfo.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Document type and recipient email are required'
      });
    }

    // Find recipient user
    const recipient = await User.findOne({ where: { email: recipientEmail } });
    if (!recipient) {
      await deleteFile(req.fileInfo.path);
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found'
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

    // Create document record
    const document = await Document.create({
      filename: req.fileInfo.filename,
      originalName: req.fileInfo.originalName,
      filePath: req.fileInfo.path,
      hash: fileHash,
      issuerId: issuer.id,
      individualId: recipient.id,
      documentTypeId: null, // We'll add document types later
      status: 'pending',
      extractedText: ocrResult.text,
      metadata: {
        fileSize: req.fileInfo.size,
        mimeType: req.fileInfo.mimetype,
        uploadedAt: new Date().toISOString(),
        description: description || null,
        documentType: documentType,
        ocrResult: {
          confidence: ocrResult.confidence,
          wordCount: ocrResult.wordCount,
          success: ocrResult.success
        },
        textAnalysis: textAnalysis,
        issuerInfo: {
          name: issuer.getFullName(),
          organization: issuer.organization
        },
        recipientInfo: {
          name: recipient.getFullName(),
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
          documentType: documentType,
          uploadedAt: document.createdAt,
          extractedTextPreview: ocrResult.text.substring(0, 200) + (ocrResult.text.length > 200 ? '...' : ''),
          ocrConfidence: ocrResult.confidence,
          textAnalysis: textAnalysis,
          issuer: {
            name: issuer.getFullName(),
            organization: issuer.organization
          },
          recipient: {
            name: recipient.getFullName(),
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
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Format response
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      filename: doc.filename,
      originalName: doc.originalName,
      status: doc.status,
      uploadedAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      documentType: doc.metadata?.documentType || 'unknown',
      extractedTextPreview: doc.extractedText ? doc.extractedText.substring(0, 150) + '...' : null,
      ocrConfidence: doc.metadata?.ocrResult?.confidence || 0,
      issuer: {
        name: doc.issuer ? doc.issuer.getFullName() : 'Unknown',
        organization: doc.issuer?.organization,
        email: doc.issuer?.email
      },
      recipient: {
        name: doc.individual ? doc.individual.getFullName() : 'Unknown',
        email: doc.individual?.email
      }
    }));

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
        name: document.issuer ? document.issuer.getFullName() : 'Unknown',
        organization: document.issuer?.organization,
        email: document.issuer?.email
      },
      recipient: {
        id: document.individual?.id,
        name: document.individual ? document.individual.getFullName() : 'Unknown',
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
  deleteDocument
};