// File: frontend/src/services/api.js

import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('doc_verify_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        headers: config.headers,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  },
  (error) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          if (window.location.pathname !== '/login') {
            localStorage.removeItem('doc_verify_token');
            localStorage.removeItem('doc_verify_user');
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Forbidden
          console.error('Access forbidden:', data.message);
          break;
          
        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;
          
        case 422:
          // Validation error
          console.error('Validation error:', data.errors || data.message);
          break;
          
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
          
        default:
          console.error('API Error:', data.message || 'Unknown error');
      }
      
      // Return structured error
      error.apiError = {
        status,
        message: data.message || 'An error occurred',
        errors: data.errors || null,
      };
    } else if (error.request) {
      // Network error - no response received
      console.error('Network error - no response:', error.request);
      error.apiError = {
        status: 0,
        message: 'Network error - please check your connection',
        errors: null,
      };
    } else {
      // Request setup error
      console.error('Request setup error:', error.message);
      error.apiError = {
        status: -1,
        message: 'Request setup error',
        errors: null,
      };
    }
    
    return Promise.reject(error);
  }
);

// API Methods Object
const apiMethods = {
  // Auth endpoints
  auth: {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (resetData) => api.post('/auth/reset-password', resetData),
    changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (profileData) => api.put('/auth/profile', profileData),
  },
  
  // Document endpoints
  documents: {
    upload: (formData) => api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    getAll: (params = {}) => api.get('/documents', { params }),
    getById: (id) => api.get(`/documents/${id}`),
    update: (id, updateData) => api.put(`/documents/${id}`, updateData),
    delete: (id) => api.delete(`/documents/${id}`),
    download: (id) => api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    }),
  },
  
  // Verification endpoints
  verification: {
    verify: (documentId, verificationData) => api.post(`/verification/${documentId}`, verificationData),
    getVerification: (verificationId) => api.get(`/verification/${verificationId}`),
    getAllVerifications: (params = {}) => api.get('/verification', { params }),
    updateVerification: (verificationId, updateData) => api.put(`/verification/${verificationId}`, updateData),
  },
  
  // User management endpoints
  users: {
    getAll: (params = {}) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    update: (id, userData) => api.put(`/users/${id}`, userData),
    delete: (id) => api.delete(`/users/${id}`),
  },
  
  // System endpoints
  system: {
    health: () => api.get('/system/health'),
    stats: () => api.get('/system/stats'),
  },
};

// Helper functions
const apiHelpers = {
  // Handle API errors consistently
  handleError: (error) => {
    if (error.apiError) {
      return error.apiError;
    }
    
    return {
      status: 500,
      message: 'An unexpected error occurred',
      errors: null,
    };
  },
  
  // Extract data from response
  extractData: (response) => {
    return response.data;
  },
  
  // Check if request was successful
  isSuccess: (response) => {
    return response.status >= 200 && response.status < 300;
  },
  
  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('doc_verify_token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('doc_verify_token');
    }
  },
  
  // Get current auth token
  getAuthToken: () => {
    return localStorage.getItem('doc_verify_token');
  },
  
  // Clear auth data
  clearAuth: () => {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('doc_verify_token');
    localStorage.removeItem('doc_verify_user');
  },
};

// Export both the axios instance and methods
export { apiMethods, apiHelpers };
export default api;