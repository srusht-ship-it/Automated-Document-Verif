import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { extractText } from '../utils/ocr.js';
import blockchainService from './blockchainService.js';
import mlFraudDetection from './mlFraudDetection.js';

class DocumentVerificationService {
  constructor() {
    this.verificationRules = {
      birth_certificate: {
        requiredFields: ['name', 'date', 'place'],
        patterns: {
          name: /name\s*:?\s*([a-zA-Z\s]+)/i,
          date: /birth\s*:?\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
          place: /place\s*:?\s*([a-zA-Z\s,]+)/i
        },
        minConfidence: 70
      },
      academic_transcript: {
        requiredFields: ['name', 'institution', 'grade'],
        patterns: {
          name: /name\s*:?\s*([a-zA-Z\s]+)/i,
          institution: /(university|college|school)\s*:?\s*([a-zA-Z\s]+)/i,
          grade: /(grade|gpa|marks)\s*:?\s*([A-F]|\d+\.?\d*)/i
        },
        minConfidence: 75
      },
      experience_certificate: {
        requiredFields: ['name', 'company', 'duration'],
        patterns: {
          name: /name\s*:?\s*([a-zA-Z\s]+)/i,
          company: /(company|organization)\s*:?\s*([a-zA-Z\s]+)/i,
          duration: /(\d+)\s*(year|month)/i
        },
        minConfidence: 70
      }
    };
  }

  async verifyDocument(documentPath, documentType, metadata = {}) {
    try {
      const verificationResult = {
        isAuthentic: false,
        confidence: 0,
        analysis: {},
        flags: [],
        timestamp: new Date(),
        details: {}
      };

      // 1. File integrity check
      const integrityCheck = await this.checkFileIntegrity(documentPath);
      verificationResult.analysis.integrity = integrityCheck;

      // 2. OCR and text extraction
      const ocrResult = await extractText(documentPath, this.getMimeType(documentPath));
      verificationResult.analysis.ocr = ocrResult;

      if (!ocrResult.success) {
        verificationResult.flags.push('OCR_FAILED');
        return verificationResult;
      }

      // 3. Document structure analysis
      const structureAnalysis = this.analyzeDocumentStructure(ocrResult.text, documentType);
      verificationResult.analysis.structure = structureAnalysis;

      // 4. Content validation
      const contentValidation = this.validateDocumentContent(ocrResult.text, documentType);
      verificationResult.analysis.content = contentValidation;

      // 5. Metadata consistency check
      const metadataCheck = this.checkMetadataConsistency(ocrResult.text, metadata);
      verificationResult.analysis.metadata = metadataCheck;

      // 6. Fraud detection patterns
      const fraudAnalysis = this.detectFraudPatterns(ocrResult.text, documentPath);
      verificationResult.analysis.fraud = fraudAnalysis;

      // 7. Enhanced ML fraud detection
      const mlAnalysis = await mlFraudDetection.analyzeDocument(
        documentPath,
        ocrResult.text,
        documentType
      );
      verificationResult.analysis.mlFraudDetection = mlAnalysis;

      // 8. Blockchain verification
      const blockchainVerification = blockchainService.verifyDocumentOnBlockchain(
        verificationResult.analysis.integrity.hash
      );
      verificationResult.analysis.blockchain = blockchainVerification;

      // 9. Calculate overall confidence and authenticity
      const finalScore = this.calculateVerificationScore(verificationResult.analysis);
      verificationResult.confidence = finalScore.confidence;
      verificationResult.isAuthentic = finalScore.isAuthentic;
      verificationResult.details = finalScore.details;

      // 10. Store verification on blockchain
      if (verificationResult.isAuthentic) {
        const verificationRecord = blockchainService.addVerificationToBlockchain({
          documentId: documentPath.split('/').pop(),
          verifierId: 'system',
          isAuthentic: verificationResult.isAuthentic,
          confidence: verificationResult.confidence
        });
        verificationResult.blockchainVerification = verificationRecord;
      }

      return verificationResult;

    } catch (error) {
      console.error('Verification error:', error);
      return {
        isAuthentic: false,
        confidence: 0,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async checkFileIntegrity(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const fileBuffer = fs.readFileSync(filePath);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      return {
        fileSize: stats.size,
        hash: hash,
        isCorrupted: false,
        lastModified: stats.mtime
      };
    } catch (error) {
      return {
        isCorrupted: true,
        error: error.message
      };
    }
  }

  analyzeDocumentStructure(text, documentType) {
    const rules = this.verificationRules[documentType];
    if (!rules) {
      return { valid: false, reason: 'Unknown document type' };
    }

    const foundFields = {};
    let structureScore = 0;

    // Check for required fields
    for (const field of rules.requiredFields) {
      const pattern = rules.patterns[field];
      if (pattern && pattern.test(text)) {
        foundFields[field] = true;
        structureScore += 20;
      } else {
        foundFields[field] = false;
      }
    }

    return {
      valid: structureScore >= 60,
      score: structureScore,
      foundFields: foundFields,
      missingFields: rules.requiredFields.filter(field => !foundFields[field])
    };
  }

  validateDocumentContent(text, documentType) {
    const validation = {
      hasValidFormat: true,
      hasValidDates: true,
      hasValidNames: true,
      contentScore: 0,
      issues: []
    };

    // Date validation
    const datePattern = /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/g;
    const dates = text.match(datePattern) || [];
    
    for (const date of dates) {
      const parsedDate = new Date(date.replace(/[\/-]/g, '/'));
      if (isNaN(parsedDate.getTime()) || parsedDate > new Date()) {
        validation.hasValidDates = false;
        validation.issues.push(`Invalid date: ${date}`);
      }
    }

    // Name validation
    const namePattern = /name\s*:?\s*([a-zA-Z\s]{2,50})/gi;
    const names = text.match(namePattern) || [];
    
    if (names.length === 0) {
      validation.hasValidNames = false;
      validation.issues.push('No valid names found');
    }

    // Content quality check
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 10) {
      validation.issues.push('Insufficient content extracted');
      validation.contentScore -= 20;
    }

    // Calculate content score
    validation.contentScore = 100;
    if (!validation.hasValidDates) validation.contentScore -= 25;
    if (!validation.hasValidNames) validation.contentScore -= 25;
    validation.contentScore -= validation.issues.length * 10;

    return validation;
  }

  checkMetadataConsistency(text, metadata) {
    const consistency = {
      nameMatch: false,
      typeMatch: false,
      consistencyScore: 0
    };

    // Check if metadata name matches extracted name
    if (metadata.recipientInfo && metadata.recipientInfo.name) {
      const metadataName = metadata.recipientInfo.name.toLowerCase();
      const textLower = text.toLowerCase();
      
      if (textLower.includes(metadataName)) {
        consistency.nameMatch = true;
        consistency.consistencyScore += 40;
      }
    }

    // Check document type consistency
    if (metadata.documentType) {
      const typeKeywords = {
        birth_certificate: ['birth', 'certificate', 'born'],
        academic_transcript: ['transcript', 'academic', 'grade', 'university'],
        experience_certificate: ['experience', 'employment', 'work', 'company']
      };

      const keywords = typeKeywords[metadata.documentType] || [];
      const foundKeywords = keywords.filter(keyword => 
        text.toLowerCase().includes(keyword)
      );

      if (foundKeywords.length > 0) {
        consistency.typeMatch = true;
        consistency.consistencyScore += 30;
      }
    }

    return consistency;
  }

  detectFraudPatterns(text, filePath) {
    const fraudAnalysis = {
      suspiciousPatterns: [],
      riskScore: 0,
      flags: []
    };

    // Check for common fraud patterns
    const fraudPatterns = [
      { pattern: /copy|duplicate|sample/gi, risk: 30, flag: 'COPY_WATERMARK' },
      { pattern: /test|demo|example/gi, risk: 40, flag: 'TEST_DOCUMENT' },
      { pattern: /\*{3,}|x{3,}|_{3,}/g, risk: 20, flag: 'REDACTED_CONTENT' },
      { pattern: /photoshop|edited|modified/gi, risk: 50, flag: 'EDITING_TRACES' }
    ];

    for (const fraudPattern of fraudPatterns) {
      const matches = text.match(fraudPattern.pattern);
      if (matches) {
        fraudAnalysis.suspiciousPatterns.push({
          pattern: fraudPattern.pattern.source,
          matches: matches.length,
          risk: fraudPattern.risk
        });
        fraudAnalysis.riskScore += fraudPattern.risk;
        fraudAnalysis.flags.push(fraudPattern.flag);
      }
    }

    // Check for inconsistent fonts/formatting (basic check)
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
      const inconsistentLines = lines.filter(line => 
        Math.abs(line.length - avgLineLength) > avgLineLength * 0.8
      );

      if (inconsistentLines.length > lines.length * 0.3) {
        fraudAnalysis.riskScore += 15;
        fraudAnalysis.flags.push('INCONSISTENT_FORMATTING');
      }
    }

    return fraudAnalysis;
  }

  calculateVerificationScore(analysis) {
    let totalScore = 100;
    const details = {};

    // OCR confidence impact
    if (analysis.ocr && analysis.ocr.confidence) {
      const ocrPenalty = (100 - analysis.ocr.confidence) * 0.3;
      totalScore -= ocrPenalty;
      details.ocrImpact = -ocrPenalty;
    }

    // Structure analysis impact
    if (analysis.structure) {
      const structurePenalty = (100 - analysis.structure.score) * 0.4;
      totalScore -= structurePenalty;
      details.structureImpact = -structurePenalty;
    }

    // Content validation impact
    if (analysis.content) {
      const contentPenalty = (100 - Math.max(0, analysis.content.contentScore)) * 0.2;
      totalScore -= contentPenalty;
      details.contentImpact = -contentPenalty;
    }

    // Metadata consistency impact
    if (analysis.metadata) {
      const metadataPenalty = (100 - analysis.metadata.consistencyScore) * 0.1;
      totalScore -= metadataPenalty;
      details.metadataImpact = -metadataPenalty;
    }

    // Fraud detection impact
    if (analysis.fraud) {
      totalScore -= analysis.fraud.riskScore;
      details.fraudImpact = -analysis.fraud.riskScore;
    }

    // File integrity impact
    if (analysis.integrity && analysis.integrity.isCorrupted) {
      totalScore -= 50;
      details.integrityImpact = -50;
    }

    const finalConfidence = Math.max(0, Math.min(100, totalScore));
    
    return {
      confidence: Math.round(finalConfidence),
      isAuthentic: finalConfidence >= 70,
      details: details,
      threshold: 70
    };
  }

  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

export default new DocumentVerificationService();