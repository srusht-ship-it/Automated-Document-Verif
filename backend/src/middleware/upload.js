const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { sanitizePath } = require('./security');

// Ensure upload directories exist
const createUploadDirs = () => {
  const uploadDir = path.join(__dirname, '../../uploads');
  const documentsDir = path.join(uploadDir, 'documents');
  const tempDir = path.join(uploadDir, 'temp');

  [uploadDir, documentsDir, tempDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Initialize upload directories
createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadPath = sanitizePath(path.join(__dirname, '../../uploads/documents'));
      cb(null, uploadPath);
    } catch (error) {
      cb(new Error('Invalid upload destination'), null);
    }
  },
  filename: (req, file, cb) => {
    try {
      // Sanitize original filename
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      // Generate unique filename with timestamp and random string
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(6).toString('hex');
      const extension = path.extname(sanitizedName).toLowerCase();
      
      // Validate extension
      const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
      if (!allowedExtensions.includes(extension)) {
        return cb(new Error('Invalid file extension'), null);
      }
      
      const filename = `doc_${timestamp}_${randomString}${extension}`;
      cb(null, filename);
    } catch (error) {
      cb(new Error('Filename generation failed'), null);
    }
  }
});

// Enhanced file filter function
const fileFilter = (req, file, cb) => {
  try {
    // Allowed file types
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf'
    ];

    // Allowed extensions
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Check for null bytes in filename
    if (file.originalname.includes('\0')) {
      return cb(new Error('Invalid filename detected'), false);
    }

    // Check for path traversal attempts in filename
    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
      return cb(new Error('Path traversal attempt detected in filename'), false);
    }

    // Validate MIME type and extension match
    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'), false);
    }
  } catch (error) {
    cb(new Error('File validation failed'), false);
  }
};

// Configure multer with enhanced security
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1, // Single file upload
    fields: 10, // Limit number of fields
    fieldNameSize: 100, // Limit field name size
    fieldSize: 1024 * 1024 // 1MB field size limit
  },
  fileFilter: fileFilter
});

// Middleware for handling single file upload
const uploadSingle = upload.single('document');

// Enhanced upload middleware with error handling
const handleFileUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 50MB.'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Only one file is allowed.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    }

    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Add file info to request
    req.fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    next();
  });
};

// Utility function to generate file hash
const generateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

// Utility function to delete file
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Middleware to validate file exists
const validateFileExists = (req, res, next) => {
  if (!req.file || !req.fileInfo) {
    return res.status(400).json({
      success: false,
      message: 'File upload required'
    });
  }

  // Check if file actually exists on disk
  if (!fs.existsSync(req.fileInfo.path)) {
    return res.status(500).json({
      success: false,
      message: 'File upload failed - file not found'
    });
  }

  next();
};

module.exports = {
  handleFileUpload,
  validateFileExists,
  generateFileHash,
  deleteFile,
  createUploadDirs
};