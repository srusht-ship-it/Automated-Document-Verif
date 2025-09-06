// File: frontend/src/services/auth.js

import api, { apiMethods, apiHelpers } from './api';

// Authentication service for handling user login, registration, and token management
class AuthService {
  constructor() {
    this.TOKEN_KEY = 'doc_verify_token';
    this.USER_KEY = 'doc_verify_user';
    this.REFRESH_TOKEN_KEY = 'doc_verify_refresh_token';
    
    // Set default authorization header if token exists
    this.initializeAuthHeader();
  }

  /**
   * Initialize authorization header with existing token
   */
  initializeAuthHeader() {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      apiHelpers.setAuthToken(token);
    }
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      const response = await apiMethods.auth.register(userData);
      
      // Handle both nested and flat response structures
      const responseData = response.data.data || response.data;
      
      if (responseData.token) {
        this.setAuthData(responseData.token, responseData.user);
      }
      
      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} Login response
   */
  async login(credentials) {
    try {
      const response = await apiMethods.auth.login(credentials);
      
      // Handle both nested and flat response structures
      const responseData = response.data.data || response.data;
      
      if (responseData.token) {
        this.setAuthData(responseData.token, responseData.user);
      }
      
      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    // Remove tokens and user data
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    
    // Remove authorization header
    apiHelpers.clearAuth();
  }

  /**
   * Get current user token
   * @returns {string|null} JWT token
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get current user data
   * @returns {Object|null} User data
   */
  getCurrentUser() {
    const userData = localStorage.getItem(this.USER_KEY);
    try {
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = this.getToken();
    return token && this.isTokenValid(token);
  }

  /**
   * Check if token is valid (not expired)
   * @param {string} token - JWT token
   * @returns {boolean} Token validity
   */
  isTokenValid(token) {
    try {
      const payload = this.parseJWT(token);
      const currentTime = Date.now() / 1000;
      
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse JWT token
   * @param {string} token - JWT token
   * @returns {Object} Token payload
   */
  parseJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  }

  /**
   * Get user role
   * @returns {string|null} User role
   */
  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Role match
   */
  hasRole(role) {
    return this.getUserRole() === role;
  }

  /**
   * Check if user is issuer
   * @returns {boolean} Issuer status
   */
  isIssuer() {
    return this.hasRole('issuer');
  }

  /**
   * Check if user is individual
   * @returns {boolean} Individual status
   */
  isIndividual() {
    return this.hasRole('individual');
  }

  /**
   * Check if user is verifier
   * @returns {boolean} Verifier status
   */
  isVerifier() {
    return this.hasRole('verifier');
  }

  /**
   * Refresh authentication token (not implemented in backend)
   * @returns {Promise<Object>} Refresh response
   */
  async refreshToken() {
    // Refresh tokens not implemented in backend
    // Just logout the user
    this.logout();
    throw new Error('Session expired. Please login again.');
  }

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Update response
   */
  async updateProfile(profileData) {
    try {
      const response = await apiMethods.auth.updateProfile(profileData);
      
      if (response.data.user) {
        this.updateUserData(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} Change response
   */
  async changePassword(passwordData) {
    try {
      const response = await apiMethods.auth.changePassword(passwordData);
      return response.data;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset request response
   */
  async requestPasswordReset(email) {
    try {
      const response = await apiMethods.auth.forgotPassword(email);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password with token
   * @param {Object} resetData - Reset token and new password
   * @returns {Promise<Object>} Reset response
   */
  async resetPassword(resetData) {
    try {
      const response = await apiMethods.auth.resetPassword(resetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Set authentication data in localStorage
   * @param {string} token - JWT token
   * @param {Object} user - User data
   * @param {string} refreshToken - Refresh token (optional)
   */
  setAuthData(token, user, refreshToken = null) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
    
    // Set authorization header for future requests
    apiHelpers.setAuthToken(token);
  }

  /**
   * Set token (for external use)
   * @param {string} token - JWT token
   */
  setToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
    apiHelpers.setAuthToken(token);
  }

  /**
   * Update user data in localStorage
   * @param {Object} user - Updated user data
   */
  updateUserData(user) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Handle authentication errors
   * @param {Error} error - Authentication error
   */
  handleAuthError(error) {
    if (error.response?.status === 401) {
      // Token expired or invalid
      this.logout();
    } else if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      console.error('Access denied:', error.response.data.message);
    }
  }

  /**
   * Setup token refresh interceptor
   */
  setupTokenRefreshInterceptor() {
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - logout user
          this.logout();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get authorization header
   * @returns {Object} Authorization header
   */
  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Check token expiry and refresh if needed
   */
  async checkTokenExpiry() {
    const token = this.getToken();
    
    if (!token) return;
    
    try {
      const payload = this.parseJWT(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      
      // Refresh token if it expires in less than 5 minutes
      if (timeUntilExpiry < 300) {
        await this.refreshToken();
      }
    } catch (error) {
      console.error('Error checking token expiry:', error);
      this.logout();
    }
  }
}

// Create and export singleton instance
const authService = new AuthService();

// Setup token refresh interceptor
authService.setupTokenRefreshInterceptor();

export default authService;