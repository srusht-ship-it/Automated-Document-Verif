import fs from 'fs';
import path from 'path';

class MLFraudDetectionService {
  constructor() {
    this.fraudPatterns = this.loadFraudPatterns();
    this.documentTemplates = this.loadDocumentTemplates();
  }

  loadFraudPatterns() {
    return {
      textPatterns: [
        { pattern: /copy|duplicate|sample|test|demo/gi, weight: 0.8, type: 'watermark' },
        { pattern: /photoshop|edited|modified|fake/gi, weight: 0.9, type: 'editing' },
        { pattern: /\*{3,}|x{3,}|_{3,}|#{3,}/g, weight: 0.6, type: 'redaction' },
        { pattern: /lorem ipsum|placeholder|example/gi, weight: 0.7, type: 'template' }
      ],
      structuralPatterns: [
        { name: 'inconsistent_fonts', threshold: 0.3, weight: 0.5 },
        { name: 'irregular_spacing', threshold: 0.4, weight: 0.4 },
        { name: 'misaligned_text', threshold: 0.35, weight: 0.6 }
      ],
      statisticalAnomalies: [
        { name: 'unusual_word_frequency', threshold: 2.0, weight: 0.3 },
        { name: 'abnormal_character_distribution', threshold: 1.5, weight: 0.4 }
      ]
    };
  }

  loadDocumentTemplates() {
    return {
      birth_certificate: {
        requiredElements: ['name', 'date_of_birth', 'place_of_birth', 'parents'],
        commonPhrases: ['certificate of birth', 'born on', 'state of', 'county of'],
        layoutPatterns: ['header_centered', 'official_seal', 'signature_bottom']
      },
      academic_transcript: {
        requiredElements: ['student_name', 'institution', 'courses', 'grades', 'gpa'],
        commonPhrases: ['transcript', 'academic record', 'grade point average', 'credit hours'],
        layoutPatterns: ['table_format', 'institutional_header', 'registrar_signature']
      },
      experience_certificate: {
        requiredElements: ['employee_name', 'company', 'position', 'duration', 'salary'],
        commonPhrases: ['employment certificate', 'worked as', 'from', 'to', 'salary'],
        layoutPatterns: ['company_letterhead', 'hr_signature', 'company_seal']
      }
    };
  }

  async analyzeDocument(documentPath, extractedText, documentType) {
    try {
      const analysis = {
        fraudScore: 0,
        confidence: 100,
        flags: [],
        details: {},
        mlPredictions: {}
      };

      // 1. Text-based fraud detection
      const textAnalysis = this.analyzeTextPatterns(extractedText);
      analysis.fraudScore += textAnalysis.score;
      analysis.flags.push(...textAnalysis.flags);
      analysis.details.textAnalysis = textAnalysis;

      // 2. Structural analysis
      const structuralAnalysis = await this.analyzeDocumentStructure(documentPath, extractedText);
      analysis.fraudScore += structuralAnalysis.score;
      analysis.flags.push(...structuralAnalysis.flags);
      analysis.details.structuralAnalysis = structuralAnalysis;

      // 3. Template matching
      const templateAnalysis = this.analyzeTemplateCompliance(extractedText, documentType);
      analysis.fraudScore += templateAnalysis.score;
      analysis.flags.push(...templateAnalysis.flags);
      analysis.details.templateAnalysis = templateAnalysis;

      // 4. Statistical anomaly detection
      const statisticalAnalysis = this.detectStatisticalAnomalies(extractedText);
      analysis.fraudScore += statisticalAnalysis.score;
      analysis.flags.push(...statisticalAnalysis.flags);
      analysis.details.statisticalAnalysis = statisticalAnalysis;

      // 5. Machine learning prediction (simulated)
      const mlPrediction = this.simulateMLPrediction(extractedText, documentType);
      analysis.mlPredictions = mlPrediction;
      analysis.fraudScore += mlPrediction.fraudScore;

      // Calculate final confidence
      analysis.confidence = Math.max(0, 100 - analysis.fraudScore);
      analysis.isAuthentic = analysis.confidence >= 70;

      return analysis;

    } catch (error) {
      console.error('ML Fraud Detection Error:', error);
      return {
        fraudScore: 100,
        confidence: 0,
        flags: ['ANALYSIS_FAILED'],
        error: error.message,
        isAuthentic: false
      };
    }
  }

  analyzeTextPatterns(text) {
    const analysis = {
      score: 0,
      flags: [],
      detectedPatterns: []
    };

    for (const pattern of this.fraudPatterns.textPatterns) {
      const matches = text.match(pattern.pattern);
      if (matches) {
        const fraudScore = matches.length * pattern.weight * 10;
        analysis.score += fraudScore;
        analysis.flags.push(`SUSPICIOUS_${pattern.type.toUpperCase()}`);
        analysis.detectedPatterns.push({
          type: pattern.type,
          matches: matches.length,
          score: fraudScore,
          examples: matches.slice(0, 3)
        });
      }
    }

    return analysis;
  }

  async analyzeDocumentStructure(documentPath, text) {
    const analysis = {
      score: 0,
      flags: [],
      structuralIssues: []
    };

    try {
      // Analyze text structure
      const lines = text.split('\n').filter(line => line.trim());
      const words = text.split(/\s+/).filter(word => word.trim());

      // Check for inconsistent line lengths (possible editing)
      const lineLengths = lines.map(line => line.length);
      const avgLineLength = lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length;
      const inconsistentLines = lineLengths.filter(len => Math.abs(len - avgLineLength) > avgLineLength * 0.8);

      if (inconsistentLines.length > lines.length * 0.3) {
        analysis.score += 15;
        analysis.flags.push('INCONSISTENT_FORMATTING');
        analysis.structuralIssues.push('High variation in line lengths detected');
      }

      // Check for unusual character patterns
      const specialCharCount = (text.match(/[^a-zA-Z0-9\s.,!?;:()\-]/g) || []).length;
      const specialCharRatio = specialCharCount / text.length;

      if (specialCharRatio > 0.05) {
        analysis.score += 10;
        analysis.flags.push('UNUSUAL_CHARACTERS');
        analysis.structuralIssues.push('High ratio of special characters');
      }

      // Check for repeated patterns (copy-paste indicators)
      const wordFreq = {};
      words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        if (cleanWord.length > 3) {
          wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
        }
      });

      const repeatedWords = Object.entries(wordFreq).filter(([word, count]) => count > 5);
      if (repeatedWords.length > 0) {
        analysis.score += repeatedWords.length * 2;
        analysis.flags.push('REPEATED_CONTENT');
        analysis.structuralIssues.push(`Excessive repetition of words: ${repeatedWords.map(([w]) => w).join(', ')}`);
      }

    } catch (error) {
      console.error('Structural analysis error:', error);
      analysis.score += 20;
      analysis.flags.push('STRUCTURE_ANALYSIS_FAILED');
    }

    return analysis;
  }

  analyzeTemplateCompliance(text, documentType) {
    const analysis = {
      score: 0,
      flags: [],
      complianceIssues: []
    };

    const template = this.documentTemplates[documentType];
    if (!template) {
      return analysis; // Unknown document type
    }

    const textLower = text.toLowerCase();

    // Check for required phrases
    const missingPhrases = template.commonPhrases.filter(phrase => 
      !textLower.includes(phrase.toLowerCase())
    );

    if (missingPhrases.length > template.commonPhrases.length * 0.5) {
      analysis.score += 20;
      analysis.flags.push('TEMPLATE_MISMATCH');
      analysis.complianceIssues.push(`Missing common phrases: ${missingPhrases.join(', ')}`);
    }

    // Check for required elements
    const missingElements = template.requiredElements.filter(element => {
      const elementPatterns = {
        'name': /name\s*:?\s*[a-zA-Z\s]+/i,
        'date_of_birth': /birth\s*:?\s*\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/i,
        'institution': /(university|college|school|institute)\s*:?\s*[a-zA-Z\s]+/i,
        'company': /(company|corporation|ltd|inc)\s*:?\s*[a-zA-Z\s]+/i
      };
      
      const pattern = elementPatterns[element];
      return pattern && !pattern.test(text);
    });

    if (missingElements.length > 0) {
      analysis.score += missingElements.length * 5;
      analysis.flags.push('MISSING_REQUIRED_ELEMENTS');
      analysis.complianceIssues.push(`Missing elements: ${missingElements.join(', ')}`);
    }

    return analysis;
  }

  detectStatisticalAnomalies(text) {
    const analysis = {
      score: 0,
      flags: [],
      anomalies: []
    };

    try {
      // Character frequency analysis
      const charFreq = {};
      for (let char of text.toLowerCase()) {
        if (char.match(/[a-z]/)) {
          charFreq[char] = (charFreq[char] || 0) + 1;
        }
      }

      // Expected English letter frequencies
      const expectedFreq = {
        'e': 12.7, 't': 9.1, 'a': 8.2, 'o': 7.5, 'i': 7.0, 'n': 6.7,
        's': 6.3, 'h': 6.1, 'r': 6.0, 'd': 4.3, 'l': 4.0, 'c': 2.8
      };

      let deviationSum = 0;
      let totalChars = Object.values(charFreq).reduce((a, b) => a + b, 0);

      for (let [char, expectedPercent] of Object.entries(expectedFreq)) {
        const actualPercent = ((charFreq[char] || 0) / totalChars) * 100;
        const deviation = Math.abs(actualPercent - expectedPercent);
        deviationSum += deviation;
      }

      const avgDeviation = deviationSum / Object.keys(expectedFreq).length;

      if (avgDeviation > 3.0) {
        analysis.score += 15;
        analysis.flags.push('ABNORMAL_CHAR_DISTRIBUTION');
        analysis.anomalies.push(`Character frequency deviation: ${avgDeviation.toFixed(2)}`);
      }

      // Word length distribution analysis
      const words = text.split(/\s+/).filter(word => word.trim());
      const wordLengths = words.map(word => word.replace(/[^a-zA-Z]/g, '').length).filter(len => len > 0);
      const avgWordLength = wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length;

      if (avgWordLength < 3 || avgWordLength > 8) {
        analysis.score += 10;
        analysis.flags.push('UNUSUAL_WORD_LENGTH');
        analysis.anomalies.push(`Unusual average word length: ${avgWordLength.toFixed(2)}`);
      }

    } catch (error) {
      console.error('Statistical analysis error:', error);
    }

    return analysis;
  }

  simulateMLPrediction(text, documentType) {
    // Simulate advanced ML model predictions
    const features = {
      textLength: text.length,
      wordCount: text.split(/\s+/).length,
      sentenceCount: text.split(/[.!?]+/).length,
      avgWordsPerSentence: 0,
      complexityScore: 0,
      formalityScore: 0
    };

    features.avgWordsPerSentence = features.wordCount / Math.max(features.sentenceCount, 1);

    // Simulate complexity analysis
    const complexWords = text.match(/\b\w{7,}\b/g) || [];
    features.complexityScore = (complexWords.length / features.wordCount) * 100;

    // Simulate formality analysis
    const formalWords = text.match(/\b(hereby|whereas|therefore|pursuant|aforementioned)\b/gi) || [];
    features.formalityScore = (formalWords.length / features.wordCount) * 100;

    // Simulate neural network prediction
    let fraudProbability = 0;

    // Feature-based scoring (simulated ML model)
    if (features.textLength < 100) fraudProbability += 0.2;
    if (features.avgWordsPerSentence < 5 || features.avgWordsPerSentence > 25) fraudProbability += 0.15;
    if (features.complexityScore < 5) fraudProbability += 0.1;
    if (documentType === 'academic_transcript' && features.formalityScore < 2) fraudProbability += 0.2;

    // Add some randomness to simulate model uncertainty
    fraudProbability += (Math.random() - 0.5) * 0.1;
    fraudProbability = Math.max(0, Math.min(1, fraudProbability));

    return {
      fraudProbability: Math.round(fraudProbability * 100) / 100,
      fraudScore: fraudProbability * 30, // Convert to score
      confidence: Math.round((1 - fraudProbability) * 100),
      features: features,
      modelVersion: 'v2.1.0',
      predictions: {
        isGenerated: fraudProbability > 0.7,
        isEdited: fraudProbability > 0.5,
        isTemplate: fraudProbability > 0.3
      }
    };
  }

  // Handwriting recognition simulation
  async detectHandwriting(imagePath) {
    try {
      // This would integrate with a real handwriting detection model
      // For now, simulate based on file characteristics
      
      const stats = fs.statSync(imagePath);
      const isLikelyHandwritten = Math.random() > 0.7; // Simulate detection
      
      return {
        hasHandwriting: isLikelyHandwritten,
        confidence: Math.round(Math.random() * 30 + 70),
        regions: isLikelyHandwritten ? [
          { x: 100, y: 200, width: 300, height: 50, type: 'signature' },
          { x: 50, y: 400, width: 200, height: 30, type: 'notes' }
        ] : [],
        analysis: {
          signatureDetected: isLikelyHandwritten,
          handwrittenText: isLikelyHandwritten ? 'Detected handwritten elements' : 'No handwriting detected'
        }
      };
    } catch (error) {
      return {
        hasHandwriting: false,
        confidence: 0,
        error: error.message
      };
    }
  }
}

export default new MLFraudDetectionService();