const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// OCR Configuration
const OCR_CONFIG = {
  lang: process.env.OCR_LANGUAGE || 'eng',
  logger: process.env.NODE_ENV === 'development' ? m => console.log(m) : undefined,
  confidence_threshold: parseInt(process.env.OCR_CONFIDENCE_THRESHOLD) || 60
};

/**
 * Preprocess image for better OCR results
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Path to processed image
 */
const preprocessImage = async (imagePath) => {
  try {
    const tempPath = imagePath.replace(path.extname(imagePath), '_processed.png');
    
    await sharp(imagePath)
      .grayscale() // Convert to grayscale
      .normalize() // Enhance contrast
      .sharpen() // Sharpen the image
      .png() // Convert to PNG for better OCR
      .toFile(tempPath);
    
    return tempPath;
  } catch (error) {
    console.error('Image preprocessing failed:', error);
    // Return original path if preprocessing fails
    return imagePath;
  }
};

/**
 * Extract text from image using Tesseract OCR
 * @param {string} imagePath - Path to the image file
 * @param {Object} options - OCR options
 * @returns {Promise<Object>} - OCR results
 */
const extractTextFromImage = async (imagePath, options = {}) => {
  try {
    console.log(`Starting OCR for: ${imagePath}`);
    
    // Preprocess image for better OCR results
    const processedImagePath = await preprocessImage(imagePath);
    
    // Perform OCR
    const { data } = await Tesseract.recognize(processedImagePath, OCR_CONFIG.lang, {
      logger: OCR_CONFIG.logger,
      ...options
    });

    // Clean up processed image if it's different from original
    if (processedImagePath !== imagePath) {
      try {
        await fs.promises.unlink(processedImagePath);
      } catch (error) {
        console.warn('Failed to clean up processed image:', error);
      }
    }

    // Filter out low-confidence text
    const filteredWords = data.words.filter(word => 
      word.confidence >= OCR_CONFIG.confidence_threshold
    );

    const extractedText = data.text.trim();
    const averageConfidence = data.confidence;

    console.log(`OCR completed. Confidence: ${averageConfidence}%`);

    return {
      success: true,
      text: extractedText,
      confidence: averageConfidence,
      wordCount: filteredWords.length,
      words: filteredWords.map(word => ({
        text: word.text,
        confidence: word.confidence,
        bbox: word.bbox
      })),
      lines: data.lines.map(line => ({
        text: line.text,
        confidence: line.confidence,
        bbox: line.bbox
      })),
      metadata: {
        processingTime: Date.now(),
        ocrEngine: 'Tesseract.js',
        language: OCR_CONFIG.lang,
        imageSize: data.imageSize
      }
    };

  } catch (error) {
    console.error('OCR extraction failed:', error);
    return {
      success: false,
      error: error.message,
      text: '',
      confidence: 0,
      wordCount: 0,
      words: [],
      lines: []
    };
  }
};

/**
 * Extract text from PDF (first page only for now)
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<Object>} - Extracted text results
 */
const extractTextFromPDF = async (pdfPath) => {
  try {
    // For now, we'll return a placeholder
    // In a production system, you'd use pdf-parse or pdf2pic + OCR
    console.log(`PDF text extraction not fully implemented for: ${pdfPath}`);
    
    return {
      success: false,
      text: '',
      confidence: 0,
      error: 'PDF text extraction not implemented yet',
      metadata: {
        processingTime: Date.now(),
        fileType: 'PDF'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      text: '',
      confidence: 0
    };
  }
};

/**
 * Main function to extract text from any supported file
 * @param {string} filePath - Path to the file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<Object>} - Extraction results
 */
const extractText = async (filePath, mimeType) => {
  try {
    console.log(`Extracting text from ${filePath} (${mimeType})`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    let result;

    if (mimeType === 'application/pdf') {
      result = await extractTextFromPDF(filePath);
    } else if (mimeType.startsWith('image/')) {
      result = await extractTextFromImage(filePath);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    return result;

  } catch (error) {
    console.error('Text extraction failed:', error);
    return {
      success: false,
      error: error.message,
      text: '',
      confidence: 0,
      metadata: {
        processingTime: Date.now(),
        error: true
      }
    };
  }
};

/**
 * Analyze extracted text for document patterns
 * @param {string} text - Extracted text
 * @returns {Object} - Analysis results
 */
const analyzeDocumentText = (text) => {
  const analysis = {
    hasName: false,
    hasDate: false,
    hasInstitution: false,
    hasGrades: false,
    documentType: 'unknown',
    extractedFields: {}
  };

  if (!text || text.trim().length === 0) {
    return analysis;
  }

  const textLower = text.toLowerCase();

  // Check for common patterns
  const namePattern = /name\s*:?\s*([a-zA-Z\s]+)/i;
  const datePattern = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/;
  const gradePattern = /grade|gpa|marks|score/i;

  // Extract potential name
  const nameMatch = text.match(namePattern);
  if (nameMatch) {
    analysis.hasName = true;
    analysis.extractedFields.name = nameMatch[1].trim();
  }

  // Check for dates
  if (datePattern.test(text)) {
    analysis.hasDate = true;
    const dateMatches = text.match(datePattern);
    if (dateMatches) {
      analysis.extractedFields.dates = dateMatches;
    }
  }

  // Check for grades
  if (gradePattern.test(text)) {
    analysis.hasGrades = true;
  }

  // Determine document type based on keywords
  if (textLower.includes('birth') && textLower.includes('certificate')) {
    analysis.documentType = 'birth_certificate';
  } else if (textLower.includes('transcript') || textLower.includes('academic')) {
    analysis.documentType = 'academic_transcript';
  } else if (textLower.includes('experience') || textLower.includes('employment')) {
    analysis.documentType = 'experience_certificate';
  }

  return analysis;
};

module.exports = {
  extractText,
  extractTextFromImage,
  extractTextFromPDF,
  analyzeDocumentText,
  OCR_CONFIG
};