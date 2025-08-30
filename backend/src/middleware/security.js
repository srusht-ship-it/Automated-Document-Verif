const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// CSRF Protection Middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests and health checks
  if (req.method === 'GET' || req.path === '/api/health') {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.headers['x-session-token'];

  if (!token || !sessionToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token required'
    });
  }

  // Verify CSRF token matches session
  const expectedToken = crypto.createHmac('sha256', process.env.JWT_SECRET)
    .update(sessionToken)
    .digest('hex');

  if (token !== expectedToken) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }

  next();
};

// Generate CSRF token
const generateCSRFToken = (sessionToken) => {
  return crypto.createHmac('sha256', process.env.JWT_SECRET)
    .update(sessionToken)
    .digest('hex');
};

// Path Traversal Protection
const sanitizePath = (userPath) => {
  if (!userPath || typeof userPath !== 'string') {
    throw new Error('Invalid path provided');
  }

  // Remove null bytes
  const cleanPath = userPath.replace(/\0/g, '');
  
  // Resolve path to prevent traversal
  const resolvedPath = path.resolve(cleanPath);
  
  // Define allowed base directories
  const allowedDirs = [
    path.resolve(__dirname, '../../uploads'),
    path.resolve(__dirname, '../../temp')
  ];

  // Check if resolved path is within allowed directories
  const isAllowed = allowedDirs.some(allowedDir => 
    resolvedPath.startsWith(allowedDir)
  );

  if (!isAllowed) {
    throw new Error('Path traversal attempt detected');
  }

  return resolvedPath;
};

// File Access Protection Middleware
const protectFileAccess = (req, res, next) => {
  try {
    if (req.params.filename || req.query.file) {
      const filename = req.params.filename || req.query.file;
      
      // Sanitize the filename
      const sanitizedPath = sanitizePath(path.join(__dirname, '../../uploads/documents', filename));
      
      // Check if file exists and is within allowed directory
      if (!fs.existsSync(sanitizedPath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Add sanitized path to request
      req.sanitizedFilePath = sanitizedPath;
    }
    
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file path'
    });
  }
};

// Input Sanitization
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Remove potential XSS and injection attempts
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/\0/g, '')
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// File Upload Security
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const file = req.file;
  
  // Check file size (50MB max)
  if (file.size > 50 * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 50MB.'
    });
  }

  // Validate file extension
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.'
    });
  }

  // Validate MIME type
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type detected.'
    });
  }

  // Check for malicious file signatures
  const maliciousSignatures = [
    Buffer.from([0x4D, 0x5A]), // PE executable
    Buffer.from([0x7F, 0x45, 0x4C, 0x46]), // ELF executable
    Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]), // Java class file
  ];

  if (fs.existsSync(file.path)) {
    const fileBuffer = fs.readFileSync(file.path, { start: 0, end: 10 });
    
    for (const signature of maliciousSignatures) {
      if (fileBuffer.indexOf(signature) === 0) {
        // Delete malicious file
        fs.unlinkSync(file.path);
        return res.status(400).json({
          success: false,
          message: 'Malicious file detected and blocked.'
        });
      }
    }
  }

  next();
};

// Request Size Limiting
const limitRequestSize = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length']);
  
  if (contentLength > 100 * 1024 * 1024) { // 100MB limit
    return res.status(413).json({
      success: false,
      message: 'Request too large'
    });
  }
  
  next();
};

// Security Headers
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  );
  
  next();
};

module.exports = {
  csrfProtection,
  generateCSRFToken,
  sanitizePath,
  protectFileAccess,
  sanitizeInput,
  validateFileUpload,
  limitRequestSize,
  securityHeaders
};