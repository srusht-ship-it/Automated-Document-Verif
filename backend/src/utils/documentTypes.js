// Document type definitions and categorization
const DOCUMENT_TYPES = {
  // Educational Documents
  'academic_transcript': {
    id: 'academic_transcript',
    name: 'Academic Transcript',
    category: 'education',
    description: 'Official academic records and grades',
    icon: '📜',
    requiredFields: ['institution', 'studentName', 'graduationDate']
  },
  'degree_certificate': {
    id: 'degree_certificate',
    name: 'Degree Certificate',
    category: 'education',
    description: 'University or college degree certificate',
    icon: '🎓',
    requiredFields: ['institution', 'degree', 'graduationDate']
  },
  'diploma': {
    id: 'diploma',
    name: 'Diploma',
    category: 'education',
    description: 'Educational diploma or certification',
    icon: '📋',
    requiredFields: ['institution', 'program', 'completionDate']
  },

  // Identity Documents
  'passport': {
    id: 'passport',
    name: 'Passport',
    category: 'identity',
    description: 'Government-issued passport',
    icon: '📘',
    requiredFields: ['passportNumber', 'fullName', 'nationality']
  },
  'national_id': {
    id: 'national_id',
    name: 'National ID',
    category: 'identity',
    description: 'National identity card',
    icon: '🆔',
    requiredFields: ['idNumber', 'fullName', 'dateOfBirth']
  },
  'drivers_license': {
    id: 'drivers_license',
    name: 'Driver\'s License',
    category: 'identity',
    description: 'Driving license document',
    icon: '🚗',
    requiredFields: ['licenseNumber', 'fullName', 'expiryDate']
  },

  // Employment Documents
  'employment_certificate': {
    id: 'employment_certificate',
    name: 'Employment Certificate',
    category: 'employment',
    description: 'Certificate of employment',
    icon: '💼',
    requiredFields: ['employer', 'employeeName', 'position']
  },
  'experience_letter': {
    id: 'experience_letter',
    name: 'Experience Letter',
    category: 'employment',
    description: 'Work experience verification letter',
    icon: '📝',
    requiredFields: ['employer', 'employeeName', 'duration']
  },
  'salary_certificate': {
    id: 'salary_certificate',
    name: 'Salary Certificate',
    category: 'employment',
    description: 'Salary verification document',
    icon: '💰',
    requiredFields: ['employer', 'employeeName', 'salary']
  },

  // Legal Documents
  'birth_certificate': {
    id: 'birth_certificate',
    name: 'Birth Certificate',
    category: 'legal',
    description: 'Official birth certificate',
    icon: '👶',
    requiredFields: ['fullName', 'dateOfBirth', 'placeOfBirth']
  },
  'marriage_certificate': {
    id: 'marriage_certificate',
    name: 'Marriage Certificate',
    category: 'legal',
    description: 'Official marriage certificate',
    icon: '💒',
    requiredFields: ['spouseName1', 'spouseName2', 'marriageDate']
  },

  // Financial Documents
  'bank_statement': {
    id: 'bank_statement',
    name: 'Bank Statement',
    category: 'financial',
    description: 'Bank account statement',
    icon: '🏦',
    requiredFields: ['accountHolder', 'accountNumber', 'statementPeriod']
  },
  'tax_document': {
    id: 'tax_document',
    name: 'Tax Document',
    category: 'financial',
    description: 'Tax return or tax certificate',
    icon: '📊',
    requiredFields: ['taxpayerName', 'taxYear', 'taxId']
  },

  // Medical Documents
  'medical_certificate': {
    id: 'medical_certificate',
    name: 'Medical Certificate',
    category: 'medical',
    description: 'Medical examination certificate',
    icon: '🏥',
    requiredFields: ['patientName', 'doctorName', 'issueDate']
  },
  'vaccination_record': {
    id: 'vaccination_record',
    name: 'Vaccination Record',
    category: 'medical',
    description: 'Vaccination history document',
    icon: '💉',
    requiredFields: ['patientName', 'vaccineType', 'vaccinationDate']
  },

  // Other Documents
  'other': {
    id: 'other',
    name: 'Other Document',
    category: 'other',
    description: 'Other type of document',
    icon: '📄',
    requiredFields: []
  }
};

const DOCUMENT_CATEGORIES = {
  'education': {
    name: 'Education',
    description: 'Academic and educational documents',
    icon: '🎓',
    color: '#3b82f6'
  },
  'identity': {
    name: 'Identity',
    description: 'Government-issued identity documents',
    icon: '🆔',
    color: '#10b981'
  },
  'employment': {
    name: 'Employment',
    description: 'Work and employment related documents',
    icon: '💼',
    color: '#f59e0b'
  },
  'legal': {
    name: 'Legal',
    description: 'Legal and civil documents',
    icon: '⚖️',
    color: '#ef4444'
  },
  'financial': {
    name: 'Financial',
    description: 'Banking and financial documents',
    icon: '💰',
    color: '#8b5cf6'
  },
  'medical': {
    name: 'Medical',
    description: 'Health and medical documents',
    icon: '🏥',
    color: '#06b6d4'
  },
  'other': {
    name: 'Other',
    description: 'Other types of documents',
    icon: '📄',
    color: '#6b7280'
  }
};

/**
 * Get all document types
 */
const getAllDocumentTypes = () => {
  return Object.values(DOCUMENT_TYPES);
};

/**
 * Get document types by category
 */
const getDocumentTypesByCategory = (category) => {
  return Object.values(DOCUMENT_TYPES).filter(type => type.category === category);
};

/**
 * Get document type by ID
 */
const getDocumentTypeById = (typeId) => {
  return DOCUMENT_TYPES[typeId] || DOCUMENT_TYPES.other;
};

/**
 * Get all categories
 */
const getAllCategories = () => {
  return Object.values(DOCUMENT_CATEGORIES);
};

/**
 * Get category by ID
 */
const getCategoryById = (categoryId) => {
  return DOCUMENT_CATEGORIES[categoryId] || DOCUMENT_CATEGORIES.other;
};

/**
 * Validate document type
 */
const isValidDocumentType = (typeId) => {
  return typeId in DOCUMENT_TYPES;
};

/**
 * Get document type suggestions based on extracted text
 */
const suggestDocumentType = (extractedText) => {
  if (!extractedText) return 'other';
  
  const text = extractedText.toLowerCase();
  
  // Education keywords
  if (text.includes('transcript') || text.includes('grade') || text.includes('gpa')) {
    return 'academic_transcript';
  }
  if (text.includes('degree') || text.includes('bachelor') || text.includes('master') || text.includes('phd')) {
    return 'degree_certificate';
  }
  if (text.includes('diploma') || text.includes('certificate of completion')) {
    return 'diploma';
  }
  
  // Identity keywords
  if (text.includes('passport') || text.includes('passport number')) {
    return 'passport';
  }
  if (text.includes('national id') || text.includes('identity card')) {
    return 'national_id';
  }
  if (text.includes('driver') || text.includes('license')) {
    return 'drivers_license';
  }
  
  // Employment keywords
  if (text.includes('employment') || text.includes('work certificate')) {
    return 'employment_certificate';
  }
  if (text.includes('experience') || text.includes('work experience')) {
    return 'experience_letter';
  }
  if (text.includes('salary') || text.includes('compensation')) {
    return 'salary_certificate';
  }
  
  // Legal keywords
  if (text.includes('birth certificate') || text.includes('born on')) {
    return 'birth_certificate';
  }
  if (text.includes('marriage') || text.includes('married')) {
    return 'marriage_certificate';
  }
  
  // Financial keywords
  if (text.includes('bank statement') || text.includes('account balance')) {
    return 'bank_statement';
  }
  if (text.includes('tax') || text.includes('income tax')) {
    return 'tax_document';
  }
  
  // Medical keywords
  if (text.includes('medical') || text.includes('health certificate')) {
    return 'medical_certificate';
  }
  if (text.includes('vaccination') || text.includes('vaccine')) {
    return 'vaccination_record';
  }
  
  return 'other';
};

module.exports = {
  DOCUMENT_TYPES,
  DOCUMENT_CATEGORIES,
  getAllDocumentTypes,
  getDocumentTypesByCategory,
  getDocumentTypeById,
  getAllCategories,
  getCategoryById,
  isValidDocumentType,
  suggestDocumentType
};