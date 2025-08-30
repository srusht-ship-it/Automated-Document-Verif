const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import security middleware
const { 
  csrfProtection, 
  protectFileAccess, 
  sanitizeInput, 
  validateFileUpload, 
  limitRequestSize, 
  securityHeaders 
} = require('./middleware/security');

// Import database and models
const { sequelize, testConnection } = require('./config/database');
const { syncModels } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const userRoutes = require('./routes/users');
const templateRoutes = require('./routes/templates');
const bulkRoutes = require('./routes/bulk');
const verificationRoutes = require('./routes/verification');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Additional security headers
app.use(securityHeaders);

// Request size limiting
app.use(limitRequestSize);

// Input sanitization
app.use(sanitizeInput);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser middleware with security limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for signature verification if needed
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 100
}));

// Protected static files for uploads
app.use('/uploads', protectFileAccess, express.static(path.join(__dirname, '../uploads'), {
  dotfiles: 'deny',
  index: false,
  setHeaders: (res, path) => {
    // Prevent execution of uploaded files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'attachment');
  }
}));

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Document Verification System API is running', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// CSRF Protection for state-changing operations
app.use('/api', (req, res, next) => {
  // Skip CSRF for auth routes (login/register) and GET requests
  if (req.path.startsWith('/auth') || req.method === 'GET') {
    return next();
  }
  return csrfProtection(req, res, next);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/bulk', bulkRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Initialize database models
const initializeDatabase = async () => {
  try {
    await testConnection();
    // Force sync to create missing tables
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};

// Initialize database on startup
initializeDatabase();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

module.exports = app;