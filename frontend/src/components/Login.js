// frontend/src/components/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import './login.css';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error when user starts typing
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate form
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Prepare login data
      const loginData = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      };

      // Call authentication service
      const response = await authService.login(loginData);
      
      if (response.success) {
        // Check if onLogin prop is provided and is a function
        if (onLogin && typeof onLogin === 'function') {
          onLogin(response.data.token, response.data.user);
        } else {
          // Fallback: handle login locally and redirect
          console.log('Login successful:', response.data);
          
          // Store authentication data
          localStorage.setItem('doc_verify_token', response.data.token);
          localStorage.setItem('doc_verify_user', JSON.stringify(response.data.user));
          
          // Update auth service state if it has a method for this
          if (authService.setToken) {
            authService.setToken(response.data.token);
          }
          
          // Navigate based on user role
          const userRole = response.data.user.role;
          switch (userRole) {
            case 'issuer':
              navigate('/issuer-dashboard');
              break;
            case 'individual':
              navigate('/individual-dashboard');
              break;
            case 'verifier':
              navigate('/verifier-dashboard');
              break;
            default:
              navigate('/');
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response && error.response.status === 401) {
        setErrors({ general: 'Invalid email or password. Please try again.' });
      } else if (error.response && error.response.status === 404) {
        setErrors({ general: 'Account not found. Please check your email or register.' });
      } else if (error.response && error.response.data) {
        // Handle API errors
        setErrors({ 
          general: error.response.data.message || 'Login failed. Please try again.' 
        });
      } else {
        setErrors({ 
          general: error.message || 'Login failed. Please check your connection and try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick login with demo credentials
  const handleDemoLogin = (demoType) => {
    const demoCredentials = {
      issuer: { email: 'issuer@demo.com', password: 'demo123' },
      individual: { email: 'individual@demo.com', password: 'demo123' },
      verifier: { email: 'verifier@demo.com', password: 'demo123' }
    };

    if (demoCredentials[demoType]) {
      setFormData(demoCredentials[demoType]);
      setErrors({});
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
          {/* General Error */}
          {errors.general && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {errors.general}
            </div>
          )}

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
              disabled={loading}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
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
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Forgot Password Link */}
          <div className="forgot-password">
            <Link to="/forgot-password" className="forgot-link">
              Forgot your password?
            </Link>
          </div>

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

        {/* Demo Credentials Section */}
        <div className="demo-credentials">
          <h4>🎯 Quick Demo Access</h4>
          <p className="demo-description">
            Try different user roles with these demo accounts:
          </p>
          <div className="demo-accounts">
            <div className="demo-account">
              <div className="demo-info">
                <span className="demo-role">🏛️ <strong>Issuer</strong></span>
                <small>Issue and manage official documents</small>
              </div>
              <button
                type="button"
                className="demo-button"
                onClick={() => handleDemoLogin('issuer')}
                disabled={loading}
              >
                Try Issuer
              </button>
            </div>
            
            <div className="demo-account">
              <div className="demo-info">
                <span className="demo-role">👤 <strong>Individual</strong></span>
                <small>Access personal document portfolio</small>
              </div>
              <button
                type="button"
                className="demo-button"
                onClick={() => handleDemoLogin('individual')}
                disabled={loading}
              >
                Try Individual
              </button>
            </div>
            
            <div className="demo-account">
              <div className="demo-info">
                <span className="demo-role">🔍 <strong>Verifier</strong></span>
                <small>Verify document authenticity</small>
              </div>
              <button
                type="button"
                className="demo-button"
                onClick={() => handleDemoLogin('verifier')}
                disabled={loading}
              >
                Try Verifier
              </button>
            </div>
          </div>
          
          <div className="demo-credentials-display">
            {formData.email && formData.password && (
              <div className="current-credentials">
                <small>
                  <strong>Current:</strong> {formData.email} / {formData.password}
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <small>
            🔒 Your login is secured with industry-standard encryption. 
            We never store your password in plain text.
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;