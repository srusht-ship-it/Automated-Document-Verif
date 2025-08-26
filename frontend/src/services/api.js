// api.js - Complete API service for frontend-backend integration

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to get multipart form headers
const getMultipartHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
    // Don't set Content-Type for multipart - browser will set it with boundary
  };
};

// Generic API request handler
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...options.headers,
      }
    });

    // Handle non-JSON responses (like file downloads)
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        errorMessage = await response.text();
      }
      
      throw new Error(errorMessage);
    }

    // Return blob for file downloads
    if (contentType && (contentType.includes('application/pdf') || contentType.includes('image/'))) {
      return await response.blob();
    }

    // Return JSON for most responses
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    // Return text for other responses
    return await response.text();
  } catch (error) {
    console.error('API Request Error:', error);
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    
    throw error;
  }
};

// Authentication API calls
export const authAPI = {
  // User registration
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
  },

  // User login
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
  },

  // Get current user profile
  getProfile: async () => {
    return apiRequest('/auth/profile', {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, password: newPassword })
    });
  },

  // Verify email with token
  verifyEmail: async (token) => {
    return apiRequest('/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
  }
};

// Document Management API calls
export const documentAPI = {
  // Upload document
  upload: async (file, documentData = {}) => {
    const formData = new FormData();
    formData.append('document', file);
    
    // Add additional document metadata
    Object.keys(documentData).forEach(key => {
      formData.append(key, documentData[key]);
    });

    return apiRequest('/documents/upload', {
      method: 'POST',
      headers: getMultipartHeaders(),
      body: formData
    });
  },

  // Bulk upload documents
  bulkUpload: async (files, documentData = {}) => {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('documents', file);
    });
    
    // Add metadata for all files
    Object.keys(documentData).forEach(key => {
      formData.append(key, documentData[key]);
    });

    return apiRequest('/documents/bulk-upload', {
      method: 'POST',
      headers: getMultipartHeaders(),
      body: formData
    });
  },

  // Get user's documents
  getUserDocuments: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `/documents?${queryParams}` : '/documents';
    
    return apiRequest(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },

  // Get specific document by ID
  getDocument: async (documentId) => {
    return apiRequest(`/documents/${documentId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },

  // Download document file
  downloadDocument: async (documentId) => {
    return apiRequest(`/documents/${documentId}/download`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },

  // Update document metadata
  updateDocument: async (documentId, updateData) => {
    return apiRequest(`/documents/${documentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
  },

  // Delete document
  deleteDocument: async (documentId) => {
    return apiRequest(`/documents/${documentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  // Get document verification status
  getVerificationStatus: async (documentId) => {
    return apiRequest(`/documents/${documentId}/verification-status`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },

  // Share document (generate share link)
  shareDocument: async (documentId, shareOptions = {}) => {
    return apiRequest(`/documents/${documentId}/share`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(shareOptions)
    });
  }
};

// Verification API calls (for verifiers)
export const verificationAPI = {
  // Verify document by upload
  verifyByUpload: async (file) => {
    const formData = new FormData();
    formData.append('document', file);

    return apiRequest('/verification/verify-upload', {
      method: 'POST',
      headers: getMultipartHeaders(),
      body: formData
    });
  },

  // Verify document by ID
  verifyById: async (documentId) => {
    return apiRequest('/verification/verify-id', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ documentId })
    });
  },

  // Get verification requests
  getVerificationRequests: async (status = null) => {
    const url = status ? `/verification/requests?status=${status}` : '/verification/requests';
    
    return apiRequest(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },

  // Handle verification request (accept/reject)
  handleVerificationRequest: async (requestId, action, notes = '') => {
    return apiRequest(`/verification/requests/${requestId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, notes })
    });
  },

  // Get verification history
  getVerificationHistory: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `/verification/history?${queryParams}` : '/verification/history';
    
    return apiRequest(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },

  // Request document verification from issuer
  requestVerification: async (documentId, verifierInfo) => {
    return apiRequest('/verification/request', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        documentId,
        ...verifierInfo
      })
    });
  },

  // Get verification report
  getVerificationReport: async (verificationId) => {
    return apiRequest(`/verification/report/${verificationId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
  }
};

// Analytics and Dashboard API calls
export const dashboardAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    return apiRequest('/dashboard/stats', {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    return apiRequest(`/dashboard/activities?limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },

  // Get verification analytics
  getVerificationAnalytics: async (timeframe = '7d') => {
    return apiRequest(`/dashboard/analytics?timeframe=${timeframe}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
  }
};

// System/Admin API calls
export const systemAPI = {
  // Get system health
  getSystemHealth: async () => {
    return apiRequest('/system/health', {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },

  // Get supported document types
  getSupportedDocumentTypes: async () => {
    return apiRequest('/system/document-types', {
      method: 'GET'
    });
  },

  // Get system notifications
  getNotifications: async () => {
    return apiRequest('/system/notifications', {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    return apiRequest(`/system/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
  }
};

// Blockchain API calls (for future blockchain integration)
export const blockchainAPI = {
  // Get blockchain transaction status
  getTransactionStatus: async (transactionHash) => {
    return apiRequest(`/blockchain/transaction/${transactionHash}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },

  // Verify document on blockchain
  verifyOnBlockchain: async (documentHash) => {
    return apiRequest('/blockchain/verify', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ documentHash })
    });
  },

  // Get blockchain certificate
  getCertificate: async (certificateId) => {
    return apiRequest(`/blockchain/certificate/${certificateId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
  }
};

// Utility functions
export const utils = {
  // Handle file download
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validate file type
  validateFileType: (file, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) => {
    return allowedTypes.includes(file.type);
  },

  // Validate file size
  validateFileSize: (file, maxSizeInMB = 50) => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }
};

// Error handling wrapper for components
export const withErrorHandling = (apiCall) => {
  return async (...args) => {
    try {
      return await apiCall(...args);
    } catch (error) {
      // Handle common errors
      if (error.message.includes('401')) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      if (error.message.includes('403')) {
        throw new Error('You don\'t have permission to perform this action.');
      }
      
      if (error.message.includes('404')) {
        throw new Error('The requested resource was not found.');
      }
      
      if (error.message.includes('500')) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw error;
    }
  };
};

// Export wrapped API calls with error handling
export default {
  auth: Object.keys(authAPI).reduce((acc, key) => {
    acc[key] = withErrorHandling(authAPI[key]);
    return acc;
  }, {}),
  
  document: Object.keys(documentAPI).reduce((acc, key) => {
    acc[key] = withErrorHandling(documentAPI[key]);
    return acc;
  }, {}),
  
  verification: Object.keys(verificationAPI).reduce((acc, key) => {
    acc[key] = withErrorHandling(verificationAPI[key]);
    return acc;
  }, {}),
  
  dashboard: Object.keys(dashboardAPI).reduce((acc, key) => {
    acc[key] = withErrorHandling(dashboardAPI[key]);
    return acc;
  }, {}),
  
  system: Object.keys(systemAPI).reduce((acc, key) => {
    acc[key] = withErrorHandling(systemAPI[key]);
    return acc;
  }, {}),
  
  blockchain: Object.keys(blockchainAPI).reduce((acc, key) => {
    acc[key] = withErrorHandling(blockchainAPI[key]);
    return acc;
  }, {}),
  
  utils
};