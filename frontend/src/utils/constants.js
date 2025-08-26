// File: src/utils/constants.js

// Application routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ISSUER_DASHBOARD: '/issuer/dashboard',
  INDIVIDUAL_DASHBOARD: '/individual/dashboard',
  VERIFIER_DASHBOARD: '/verifier/dashboard',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404'
};

// User roles
export const USER_ROLES = {
  INDIVIDUAL: 'individual',
  ISSUER: 'issuer',
  VERIFIER: 'verifier'
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  DOCUMENTS: {
    UPLOAD: '/documents/upload',
    LIST: '/documents',
    VERIFY: '/documents/verify',
    DOWNLOAD: '/documents/download'
  }
};

// Application configuration
export const APP_CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  APP_NAME: 'Document Verification System',
  VERSION: '1.0.0'
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'doc_verify_token',
  USER: 'doc_verify_user',
  REFRESH_TOKEN: 'doc_verify_refresh_token'
};

export default {
  ROUTES,
  USER_ROLES,
  API_ENDPOINTS,
  APP_CONFIG,
  STORAGE_KEYS
};