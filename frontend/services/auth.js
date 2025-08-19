// frontend/src/services/auth.js
import { authAPI } from './api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = this.getUserFromStorage();
  }

  // Set authentication token
  setAuthToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Remove authentication token
  removeAuthToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get user from localStorage
  getUserFromStorage() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Get user role
  getUserRole() {
    return this.user?.role || null;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.user?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    return roles.includes(this.user?.role);
  }

  // Register new user
  async register(userData) {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Store authentication data
        this.setAuthToken(token);
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        
        return { success: true, data: response.data };
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Store authentication data
        this.setAuthToken(token);
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        
        return { success: true, data: response.data };
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  logout() {
    this.removeAuthToken();
    this.user = null;
    window.location.href = '/';
  }

  // Validate current token
  async validateToken() {
    try {
      if (!this.token) {
        return false;
      }

      const response = await authAPI.validateToken();
      return response.success;
    } catch (error) {
      console.error('Token validation error:', error);
      this.removeAuthToken();
      return false;
    }
  }

  // Check token expiration
  isTokenExpired() {
    if (!this.token) return true;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  // Get token payload
  getTokenPayload() {
    if (!this.token) return null;

    try {
      return JSON.parse(atob(this.token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Auto-refresh token (if your backend supports it)
  async refreshToken() {
    try {
      // This would call a refresh endpoint if implemented
      // const response = await authAPI.refreshToken();
      // Handle token refresh logic
      console.log('Token refresh not implemented yet');
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
    }
  }

  // Setup automatic token validation
  setupTokenValidation() {
    // Check token validity every 5 minutes
    setInterval(async () => {
      if (this.isAuthenticated() && this.isTokenExpired()) {
        console.log('Token expired, logging out user');
        this.logout();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}

// Create singleton instance
export const authService = new AuthService();

// Initialize token validation on load
if (typeof window !== 'undefined') {
  authService.setupTokenValidation();
}

export default authService;