import rateLimit from 'express-rate-limit';
import auditService from '../services/auditService.js';

// IP Whitelist
const allowedIPs = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [];

export const ipWhitelist = (req, res, next) => {
  if (allowedIPs.length === 0) {
    return next(); // No IP restriction if not configured
  }

  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (!allowedIPs.includes(clientIP)) {
    auditService.logAction('IP_BLOCKED', null, {
      ipAddress: clientIP,
      userAgent: req.get('User-Agent'),
      success: false
    });
    
    return res.status(403).json({
      success: false,
      message: 'Access denied from this IP address'
    });
  }
  
  next();
};

// Enhanced Rate Limiting
export const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs: windowMs,
    max: max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      auditService.logAction('RATE_LIMIT_EXCEEDED', req.user?.id || null, {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false
      });
      
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }
  });
};

// Login Rate Limiting
export const loginRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many login attempts, please try again in 15 minutes'
);

// API Rate Limiting
export const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'API rate limit exceeded'
);

// Account Lockout Tracking
const failedAttempts = new Map();
const lockedAccounts = new Map();

export const accountLockout = (req, res, next) => {
  const { email } = req.body;
  
  if (!email) return next();
  
  // Check if account is locked
  if (lockedAccounts.has(email)) {
    const lockTime = lockedAccounts.get(email);
    const lockDuration = 30 * 60 * 1000; // 30 minutes
    
    if (Date.now() - lockTime < lockDuration) {
      auditService.logAction('LOGIN_BLOCKED_LOCKED', null, {
        email: email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false
      });
      
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to multiple failed attempts'
      });
    } else {
      // Unlock account
      lockedAccounts.delete(email);
      failedAttempts.delete(email);
    }
  }
  
  next();
};

export const trackFailedLogin = (email, req) => {
  const attempts = failedAttempts.get(email) || 0;
  const newAttempts = attempts + 1;
  
  failedAttempts.set(email, newAttempts);
  
  auditService.logAction('LOGIN_FAILED', null, {
    email: email,
    attempts: newAttempts,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    success: false
  });
  
  // Lock account after 5 failed attempts
  if (newAttempts >= 5) {
    lockedAccounts.set(email, Date.now());
    failedAttempts.delete(email);
    
    auditService.logAction('ACCOUNT_LOCKED', null, {
      email: email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: false
    });
  }
};

export const clearFailedAttempts = (email) => {
  failedAttempts.delete(email);
};

// CSRF Protection
export const csrfProtection = (req, res, next) => {
  if (req.method === 'GET') return next();
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;
  
  if (!token || token !== sessionToken) {
    auditService.logAction('CSRF_VIOLATION', req.user?.id || null, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: false
    });
    
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }
  
  next();
};

// XSS Protection Headers
export const xssProtection = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};