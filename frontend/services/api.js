// frontend/src/services/api.js
import axios from 'axios';

// Base URL for your backend API
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - remove token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      console.error('Access forbidden');
    }
    
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // User login
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Validate current token
  validateToken: async () => {
    try {
      const response = await api.get('/auth/validate');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Token validation failed' };
    }
  }
};

// Document API calls
export const documentAPI = {
  // Upload document
  uploadDocument: async (formData, onUploadProgress) => {
    try {
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onUploadProgress,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Document upload failed' };
    }
  },

  // Get user's documents
  getDocuments: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/documents?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch documents' };
    }
  },

  // Get specific document
  getDocument: async (documentId) => {
    try {
      const response = await api.get(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch document' };
    }
  },

  // Download document
  downloadDocument: async (documentId) => {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to download document' };
    }
  },

  // Delete document
  deleteDocument: async (documentId) => {
    try {
      const response = await api.delete(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete document' };
    }
  }
};

// Verification API calls (for future AI integration)
export const verificationAPI = {
  // Submit document for verification
  submitVerification: async (documentId, verificationData) => {
    try {
      const response = await api.post('/verification/submit', {
        documentId,
        ...verificationData
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Verification submission failed' };
    }
  },

  // Get verification status
  getVerificationStatus: async (verificationId) => {
    try {
      const response = await api.get(`/verification/${verificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get verification status' };
    }
  },

  // Get verification history
  getVerificationHistory: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/verification/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch verification history' };
    }
  }
};

// User profile API calls
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Profile update failed' };
    }
  }
};

// Utility functions
export const apiUtils = {
  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Handle API errors
  handleApiError: (error) => {
    if (error.response) {
      // Server responded with error status
      return error.response.data?.message || 'Server error occurred';
    } else if (error.request) {
      // Request made but no response received
      return 'Network error - please check your connection';
    } else {
      // Something else happened
      return error.message || 'An unexpected error occurred';
    }
  },

  // Format date
  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export default api;