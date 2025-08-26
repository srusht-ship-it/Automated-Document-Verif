// File: frontend/src/services/auth.js
import api from './api';

// Authentication service for handling user login, registration, and token management
class AuthService {
  constructor() {
    this.TOKEN_KEY = 'doc_verify_token';
    this.USER_KEY = 'doc_verify_user';
    this.REFRESH_TOKEN_KEY = 'doc_verify_refresh_token';
    this.interceptorSetup = false;
    this.authStateCallbacks = new Set(); // Support multiple listeners

    // Set default authorization header if token exists
    this.initializeAuthHeader();
  }

  /**
   * Initialize authorization header with existing token
   */
  initializeAuthHeader() {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Setup interceptor when api is used for the first time
    this.ensureInterceptorSetup();
  }

  /**
   * Ensure interceptor is setup only once and when api is ready
   */
  ensureInterceptorSetup() {
    if (!this.interceptorSetup && api && api.interceptors) {
      this.setupTokenRefreshInterceptor();
      this.interceptorSetup = true;
    }
  }

  async register(userData) {
    this.ensureInterceptorSetup();
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        this.setAuthData(response.data.token, response.data.user);
        this.notifyAuthStateChange(); // Notify listeners
      }
      return response.data;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async login(credentials) {
    this.ensureInterceptorSetup();
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        this.setAuthData(response.data.token, response.data.user, response.data.refreshToken);
        this.notifyAuthStateChange(); // Notify listeners
      }
      return response.data;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);

    delete api.defaults.headers.common['Authorization'];
    
    this.notifyAuthStateChange(); // Notify listeners

    window.location.href = '/login';
  }

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser() {
    const userData = localStorage.getItem(this.USER_KEY);
    try {
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  isAuthenticated() {
    const token = this.getToken();
    return token && this.isTokenValid(token);
  }

  isTokenValid(token) {
    try {
      const payload = this.parseJWT(token);
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

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

  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  hasRole(role) {
    return this.getUserRole() === role;
  }

  isIssuer() {
    return this.hasRole('issuer');
  }

  isIndividual() {
    return this.hasRole('individual');
  }

  isVerifier() {
    return this.hasRole('verifier');
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await api.post('/auth/refresh', { refreshToken });

      if (response.data.token) {
        this.setAuthData(response.data.token, response.data.user, response.data.refreshToken);
      }

      return response.data;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      if (response.data.user) {
        this.updateUserData(response.data.user);
      }
      return response.data;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async requestPasswordReset(email) {
    return api.post('/auth/forgot-password', { email }).then(res => res.data);
  }

  async resetPassword(resetData) {
    return api.post('/auth/reset-password', resetData).then(res => res.data);
  }

  setAuthData(token, user, refreshToken = null) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    this.notifyAuthStateChange(); // Notify listeners
  }

  updateUserData(user) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.notifyAuthStateChange(); // Notify listeners when user data changes
  }

  handleAuthError(error) {
    if (error?.response?.status === 401) {
      this.logout();
    } else if (error?.response?.status === 403) {
      console.error('Access denied:', error.response.data?.message);
    } else if (!error?.response) {
      console.error('Network or unexpected error:', error.message || error);
    }
  }

  /**
   * Safe Axios interceptor for token refresh
   */
  setupTokenRefreshInterceptor() {
    // Check if api is available and has interceptors
    if (!api || !api.interceptors || !api.interceptors.response) {
      console.warn("API instance not ready for interceptor setup");
      return;
    }

    try {
      api.interceptors.response.use(
        (response) => response,
        async (error) => {
          try {
            // Enhanced defensive checks
            if (!error) {
              console.error("Null or undefined error object");
              return Promise.reject(new Error("Unknown error occurred"));
            }

            // Handle network errors (no response object)
            if (!error.response) {
              console.error("Network/CORS error:", error.message || "Unknown network error");
              return Promise.reject(error);
            }

            // Handle server errors with response
            const originalRequest = error.config;
            
            // Check if we have a valid original request and it's a 401 error
            if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
              originalRequest._retry = true;

              try {
                await this.refreshToken();
                
                // Ensure headers object exists
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${this.getToken()}`;
                
                return api(originalRequest);
              } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                this.logout();
                return Promise.reject(refreshError);
              }
            }

            return Promise.reject(error);
          } catch (interceptorError) {
            console.error("Error in response interceptor:", interceptorError);
            return Promise.reject(error || interceptorError);
          }
        }
      );
    } catch (setupError) {
      console.error("Failed to setup token refresh interceptor:", setupError);
    }
  }

  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async checkTokenExpiry() {
    const token = this.getToken();
    if (!token) return;

    try {
      const payload = this.parseJWT(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;

      if (timeUntilExpiry < 300) {
        await this.refreshToken();
      }
    } catch (error) {
      console.error('Error checking token expiry:', error);
      this.logout();
    }
  }

  /**
   * Initialize auth service (called by App.js)
   */
  initializeAuth() {
    try {
      this.ensureInterceptorSetup();
      
      // Check if user is already authenticated
      if (this.isAuthenticated()) {
        console.log('User is authenticated');
        return true;
      }
      
      console.log('User is not authenticated');
      return false;
    } catch (error) {
      console.error('Error initializing auth:', error);
      return false;
    }
  }

  /**
   * Add authentication state listener (for App.js compatibility)
   */
  addAuthListener(callback) {
    if (typeof callback !== 'function') {
      console.error('Auth listener callback must be a function');
      return () => {}; // Return empty cleanup function
    }

    // Add callback to the set
    this.authStateCallbacks.add(callback);

    // Call immediately with current auth state
    try {
      callback(this.isAuthenticated(), this.getCurrentUser());
    } catch (error) {
      console.error('Error calling auth listener:', error);
    }

    // Return cleanup function
    return () => {
      this.authStateCallbacks.delete(callback);
    };
  }

  /**
   * Remove authentication state listener (for App.js compatibility)
   */
  removeAuthListener(callback) {
    if (callback) {
      this.authStateCallbacks.delete(callback);
    } else {
      // If no callback provided, clear all listeners
      this.authStateCallbacks.clear();
    }
  }

  /**
   * Notify auth state listeners when auth state changes
   */
  notifyAuthStateChange() {
    const isAuthenticated = this.isAuthenticated();
    const currentUser = this.getCurrentUser();
    
    this.authStateCallbacks.forEach(callback => {
      try {
        callback(isAuthenticated, currentUser);
      } catch (error) {
        console.error('Error notifying auth state change:', error);
      }
    });
  }
}

// Singleton instance
const authService = new AuthService();

export default authService;