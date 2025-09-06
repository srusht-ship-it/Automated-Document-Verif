import crypto from 'crypto';
import auditService from './auditService.js';

class TwoFactorService {
  constructor() {
    this.otpStore = new Map(); // In production, use Redis
    this.otpExpiry = 5 * 60 * 1000; // 5 minutes
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(email, userId) {
    const otp = this.generateOTP();
    const expiresAt = Date.now() + this.otpExpiry;
    
    // Store OTP (in production, use Redis with TTL)
    this.otpStore.set(email, {
      otp: otp,
      expiresAt: expiresAt,
      attempts: 0,
      userId: userId
    });

    // Simulate email sending (integrate with real email service)
    console.log(`📧 OTP for ${email}: ${otp}`);
    
    auditService.logAction('OTP_GENERATED', userId, {
      email: email,
      success: true
    });

    // In production, integrate with email service like SendGrid, AWS SES, etc.
    return {
      success: true,
      message: 'OTP sent to your email',
      expiresIn: this.otpExpiry / 1000 // seconds
    };
  }

  async verifyOTP(email, otp, userId) {
    const storedData = this.otpStore.get(email);
    
    if (!storedData) {
      auditService.logAction('OTP_VERIFY_FAILED', userId, {
        email: email,
        reason: 'No OTP found',
        success: false
      });
      return { success: false, message: 'No OTP found or expired' };
    }

    // Check expiry
    if (Date.now() > storedData.expiresAt) {
      this.otpStore.delete(email);
      auditService.logAction('OTP_EXPIRED', userId, {
        email: email,
        success: false
      });
      return { success: false, message: 'OTP expired' };
    }

    // Check attempts
    if (storedData.attempts >= 3) {
      this.otpStore.delete(email);
      auditService.logAction('OTP_MAX_ATTEMPTS', userId, {
        email: email,
        success: false
      });
      return { success: false, message: 'Too many failed attempts' };
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts++;
      auditService.logAction('OTP_INVALID', userId, {
        email: email,
        attempts: storedData.attempts,
        success: false
      });
      return { success: false, message: 'Invalid OTP' };
    }

    // Success
    this.otpStore.delete(email);
    auditService.logAction('OTP_VERIFIED', userId, {
      email: email,
      success: true
    });
    
    return { success: true, message: 'OTP verified successfully' };
  }

  async enable2FA(userId, email) {
    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    auditService.logAction('2FA_ENABLED', userId, {
      email: email,
      success: true
    });

    return {
      success: true,
      backupCodes: backupCodes,
      message: '2FA enabled successfully'
    };
  }

  async disable2FA(userId, email) {
    auditService.logAction('2FA_DISABLED', userId, {
      email: email,
      success: true
    });

    return {
      success: true,
      message: '2FA disabled successfully'
    };
  }
}

export default new TwoFactorService();