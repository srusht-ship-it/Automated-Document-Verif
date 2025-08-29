// File: frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Component imports - Make sure all these files exist and have default exports
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import IssuerDashboard from './pages/IssuerDashboard';
import IndividualDashboard from './pages/IndividualDashboard';
import VerifierDashboard from './pages/VerifierDashboard';
import UploadPage from './pages/UploadPage';

// Services
import authService from './services/auth';

// Styles
import './App.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong!</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Component that handles navigation after registration
const RegisterWithNavigation = () => {
  const navigate = useNavigate();

  const handleRegister = (token, user) => {
    try {
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update auth service state if it has a method for this
      if (authService.setToken) {
        authService.setToken(token);
      }
      
      console.log('Registration successful:', user);
      
      // Navigate to login page after successful registration
      navigate('/login');
    } catch (error) {
      console.error('Error handling registration:', error);
      // Fallback to home page
      navigate('/');
    }
  };

  return <Register onRegister={handleRegister} />;
};

// Component that handles navigation after login
const LoginWithNavigation = ({ onAuthChange }) => {
  const navigate = useNavigate();

  const handleLogin = (token, user) => {
    try {
      // Store authentication data
      localStorage.setItem('doc_verify_token', token);
      localStorage.setItem('doc_verify_user', JSON.stringify(user));
      
      // Update auth service state if it has a method for this
      if (authService.setToken) {
        authService.setToken(token);
      }
      
      console.log('Login successful:', user);
      
      // Update parent component auth state
      if (onAuthChange) {
        onAuthChange(true);
      }
      
      // Navigate based on user role
      switch (user.role) {
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
    } catch (error) {
      console.error('Error handling login:', error);
      // Fallback to home page
      navigate('/');
    }
  };

  return <Login onLogin={handleLogin} />;
};

// Main App Component
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = async () => {
      try {
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes to update auth state
    const handleStorageChange = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="App">
          <Navbar 
            isAuthenticated={isAuthenticated}
            user={authService.getCurrentUser()}
            onLogout={() => {
              authService.logout();
              setIsAuthenticated(false);
              window.location.href = '/';
            }}
          />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? 
                    <Navigate to="/" replace /> : 
                    <LoginWithNavigation onAuthChange={setIsAuthenticated} />
                } 
              />
              <Route 
                path="/register" 
                element={
                  isAuthenticated ? 
                    <Navigate to="/" replace /> : 
                    <RegisterWithNavigation />
                } 
              />

              {/* Protected Routes */}
              <Route
                path="/issuer-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['issuer']}>
                    <IssuerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/individual-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['individual']}>
                    <IndividualDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/verifier-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['verifier']}>
                    <VerifierDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;