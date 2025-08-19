// frontend/src/components/Login.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form data
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      // Call authentication service
      const response = await authService.login(formData);
      
      if (response.success) {
        // Call parent component's login handler
        onLogin(response.data.token, response.data.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your Document Verification account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
              className={error ? 'error' : ''}
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={loading}
                className={error ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="register-link">
              Create Account
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="demo-credentials">
          <h4>Demo Credentials</h4>
          <div className="demo-accounts">
            <div className="demo-account">
              <strong>Issuer:</strong>
              <br />
              Email: issuer@demo.com
              <br />
              Password: demo123
            </div>
            <div className="demo-account">
              <strong>Individual:</strong>
              <br />
              Email: individual@demo.com
              <br />
              Password: demo123
            </div>
            <div className="demo-account">
              <strong>Verifier:</strong>
              <br />
              Email: verifier@demo.com
              <br />
              Password: demo123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;