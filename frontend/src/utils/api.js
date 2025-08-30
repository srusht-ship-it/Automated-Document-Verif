// API utility with CSRF protection
class ApiClient {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.token = localStorage.getItem('doc_verify_token');
    this.csrfToken = localStorage.getItem('doc_verify_csrf_token');
  }

  // Update tokens
  setTokens(token, csrfToken) {
    this.token = token;
    this.csrfToken = csrfToken;
    localStorage.setItem('doc_verify_token', token);
    localStorage.setItem('doc_verify_csrf_token', csrfToken);
  }

  // Clear tokens
  clearTokens() {
    this.token = null;
    this.csrfToken = null;
    localStorage.removeItem('doc_verify_token');
    localStorage.removeItem('doc_verify_csrf_token');
    localStorage.removeItem('doc_verify_user');
  }

  // Get default headers
  getHeaders(includeCSRF = true) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (includeCSRF && this.csrfToken && this.token) {
      headers['X-CSRF-Token'] = this.csrfToken;
      headers['X-Session-Token'] = this.token;
    }

    return headers;
  }

  // GET request
  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(false) // GET requests don't need CSRF
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  }

  // POST request
  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }

  // PUT request
  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  }

  // DELETE request
  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(true)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }

  // File upload with CSRF protection
  async uploadFile(endpoint, formData) {
    try {
      const headers = {};

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      if (this.csrfToken && this.token) {
        headers['X-CSRF-Token'] = this.csrfToken;
        headers['X-Session-Token'] = this.token;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Login method
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data.token && data.data.csrfToken) {
        this.setTokens(data.data.token, data.data.csrfToken);
      }

      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Register method
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data.token && data.data.csrfToken) {
        this.setTokens(data.data.token, data.data.csrfToken);
      }

      return data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // Logout method
  logout() {
    this.clearTokens();
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;