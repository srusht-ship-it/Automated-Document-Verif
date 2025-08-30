const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { Document, User } = require('../models');

// Configure multer for CSV upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `bulk_${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Process bulk upload
const processBulkUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required'
      });
    }

    const results = [];
    const errors = [];
    const csvPath = req.file.path;

    // Parse CSV
    const csvData = await new Promise((resolve, reject) => {
      const data = [];
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => data.push(row))
        .on('end', () => resolve(data))
        .on('error', reject);
    });

    // Process each row
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      try {
        // Validate required fields
        if (!row['Document Name'] || !row['Document Type'] || !row['Recipient Email']) {
          errors.push({
            row: i + 1,
            error: 'Missing required fields: Document Name, Document Type, or Recipient Email'
          });
          continue;
        }

        // Find recipient user
        const recipient = await User.findOne({
          where: { email: row['Recipient Email'] }
        });

        if (!recipient) {
          errors.push({
            row: i + 1,
            error: `Recipient not found: ${row['Recipient Email']}`
          });
          continue;
        }

        // Create document record
        const document = await Document.create({
          originalName: row['Document Name'],
          documentType: row['Document Type'],
          status: 'pending',
          issuerId: req.user.id,
          individualId: recipient.id,
          metadata: {
            issueDate: row['Issue Date'] || new Date().toISOString(),
            expiryDate: row['Expiry Date'] || null,
            additionalInfo: row['Additional Info'] || '',
            bulkUpload: true
          }
        });

        results.push({
          row: i + 1,
          documentId: document.id,
          documentName: document.originalName,
          recipient: row['Recipient Email']
        });

      } catch (error) {
        errors.push({
          row: i + 1,
          error: error.message
        });
      }
    }

    // Clean up CSV file
    fs.unlinkSync(csvPath);

    res.json({
      success: true,
      message: 'Bulk upload processed',
      data: {
        totalRows: csvData.length,
        successful: results.length,
        failed: errors.length,
        results,
        errors
      }
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Bulk upload failed',
      error: error.message
    });
  }
};

// Get bulk upload history
const getBulkHistory = async (req, res) => {
  try {
    const issuerId = req.user.id;
    
    // Get documents created via bulk upload
    const bulkDocuments = await Document.findAll({
      where: {
        issuerId,
        metadata: {
          bulkUpload: true
        }
      },
      include: [{
        model: User,
        as: 'individual',
        attributes: ['email', 'firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    // Group by creation date (assuming same bulk upload)
    const history = {};
    bulkDocuments.forEach(doc => {
      const date = doc.createdAt.toDateString();
      if (!history[date]) {
        history[date] = {
          date,
          documents: [],
          totalCount: 0,
          successCount: 0,
          failedCount: 0
        };
      }
      history[date].documents.push(doc);
      history[date].totalCount++;
      if (doc.status === 'verified') {
        history[date].successCount++;
      } else if (doc.status === 'rejected') {
        history[date].failedCount++;
      }
    });

    res.json({
      success: true,
      data: Object.values(history)
    });

  } catch (error) {
    console.error('Get bulk history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bulk upload history'
    });
  }
};

module.exports = {
  upload,
  processBulkUpload,
  getBulkHistory
};