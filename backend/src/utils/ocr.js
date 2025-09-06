import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';

// For now, we'll create a simplified OCR utility that doesn't require Tesseract
// This will prevent installation issues and get your system running quickly

/**
 * Preprocess image for better OCR results
 */
const preprocessImage = async (imagePath) => {
  try {
    const processedPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '_processed.png');
    
    await sharp(imagePath)
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .greyscale()
      .normalize()
      .sharpen()
      .png()
      .toFile(processedPath);
    
    return processedPath;
  } catch (error) {
    console.warn('Image preprocessing failed, using original:', error.message);
    return imagePath;
  }
};

/**
 * Extract text from image using real Tesseract.js OCR
 * @param {string} imagePath - Path to the image file
 * @param {Object} options - OCR options
 * @returns {Promise<Object>} - OCR results
 */
const extractTextFromImage = async (imagePath, options = {}) => {
  try {
    console.log(`Real OCR processing for: ${imagePath}`);
    
    // Preprocess image for better OCR
    const processedPath = await preprocessImage(imagePath);
    
    // Configure Tesseract options
    const ocrOptions = {
      logger: m => console.log('OCR Progress:', m),
      ...options
    };

    // Run Tesseract OCR
    const { data } = await Tesseract.recognize(processedPath, 'eng', ocrOptions);
    
    // Clean up processed file
    if (processedPath !== imagePath && fs.existsSync(processedPath)) {
      fs.unlinkSync(processedPath);
    }

    // Extract detailed information
    const words = data.words.map(word => ({
      text: word.text,
      confidence: word.confidence,
      bbox: word.bbox
    }));

    const lines = data.lines.map(line => ({
      text: line.text,
      confidence: line.confidence,
      bbox: line.bbox
    }));

    return {
      success: true,
      text: data.text.trim(),
      confidence: Math.round(data.confidence),
      wordCount: words.length,
      words: words,
      lines: lines,
      metadata: {
        processingTime: Date.now(),
        ocrEngine: 'Tesseract.js v4',
        language: 'eng',
        imagePreprocessed: processedPath !== imagePath
      }
    };

  } catch (error) {
    console.error('Real OCR extraction failed:', error);
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
 * Extract text from PDF using Tesseract.js
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<Object>} - Extracted text results
 */
const extractTextFromPDF = async (pdfPath) => {
  try {
    console.log(`Real PDF OCR processing for: ${pdfPath}`);
    
    // Use Tesseract to extract text from PDF
    const { data } = await Tesseract.recognize(pdfPath, 'eng', {
      logger: m => console.log('PDF OCR Progress:', m)
    });

    return {
      success: true,
      text: data.text.trim(),
      confidence: Math.round(data.confidence),
      wordCount: data.words.length,
      metadata: {
        processingTime: Date.now(),
        fileType: 'PDF',
        ocrEngine: 'Tesseract.js v4'
      }
    };
  } catch (error) {
    console.error('PDF OCR extraction failed:', error);
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

export {
  extractText,
  extractTextFromImage,
  extractTextFromPDF,
  analyzeDocumentText
};