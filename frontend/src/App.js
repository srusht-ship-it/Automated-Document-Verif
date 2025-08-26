// App.js - Complete application integration with routing and state management

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';

// Pages
import HomePage from './pages/HomePage';
import IssuerDashboard from './pages/IssuerDashboard';
import IndividualDashboard from './pages/IndividualDashboard';
import VerifierDashboard from './pages/VerifierDashboard';

// Services
import authService from './services/auth';
import { ROUTES, USER_ROLES } from './utils/constants';

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
          <div className="error-content">
            <h1>Oops! Something went wrong</h1>
            <p>We're sorry, but something unexpected happened.</p>
            <button 
              onClick={() => window.location.reload()}
              className="reload-btn"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null, requireAuth = true }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authenticated = authService.isAuthenticated();
        const user = authService.getCurrentUser();
        
        setIsAuthenticated(authenticated);
        setUserRole(user?.role || null);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Check role requirement
  if (requiredRole && userRole !== requiredRole) {
    if (!isAuthenticated) {
      return <Navigate to={ROUTES.LOGIN} replace />;
    }
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case USER_ROLES.ISSUER:
        return <Navigate to={ROUTES.ISSUER_DASHBOARD} replace />;
      case USER_ROLES.INDIVIDUAL:
        return <Navigate to={ROUTES.INDIVIDUAL_DASHBOARD} replace />;
      case USER_ROLES.VERIFIER:
        return <Navigate to={ROUTES.VERIFIER_DASHBOARD} replace />;
      default:
        return <Navigate to={ROUTES.HOME} replace />;
    }
  }

  return children;
};

// Not Found Page Component
const NotFoundPage = () => (
  <div className="not-found-page">
    <div className="not-found-content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <button onClick={() => window.history.back()} className="back-btn">
        Go Back
      </button>
    </div>
  </div>
);

// Unauthorized Page Component
const UnauthorizedPage = () => (
  <div className="unauthorized-page">
    <div className="unauthorized-content">
      <h1>401</h1>
      <h2>Unauthorized Access</h2>
      <p>You don't have permission to access this page.</p>
      <button onClick={() => window.location.href = ROUTES.HOME} className="home-btn">
        Go Home
      </button>
    </div>
  </div>
);

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Initialize authentication service
    const initializeApp = async () => {
      try {
        // Initialize auth service
        const isAuthenticated = authService.initializeAuth();
        
        // Check if user is authenticated
        if (isAuthenticated) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
        }
        
        setAuthInitialized(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setAuthInitialized(true); // Still set to true to prevent infinite loading
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    // Listen for authentication state changes
    const handleAuthStateChange = (isAuthenticated, userData) => {
      if (isAuthenticated) {
        setUser(userData);
      } else {
        setUser(null);
      }
    };

    // Add auth listener - store the cleanup function
    const removeListener = authService.addAuthListener(handleAuthStateChange);

    // Cleanup listener on unmount
    return () => {
      // Use the cleanup function returned by addAuthListener (preferred method)
      if (removeListener && typeof removeListener === 'function') {
        removeListener();
      } else {
        // Fallback to removeAuthListener method
        try {
          authService.removeAuthListener(handleAuthStateChange);
        } catch (error) {
          console.error('Error removing auth listener:', error);
        }
      }
    };
  }, []);

  // Show loading screen while initializing
  if (loading || !authInitialized) {
    return (
      <div className="app-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Document Verification System</h2>
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          {/* Navigation Bar */}
          <Navbar user={user} />
          
          {/* Main Content */}
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route 
                path={ROUTES.HOME} 
                element={
                  <PublicRoute>
                    <HomePage />
                  </PublicRoute>
                } 
              />
              
              <Route 
                path={ROUTES.LOGIN} 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              
              <Route 
                path={ROUTES.REGISTER} 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />

              {/* Role-based Protected Routes */}
              <Route 
                path={ROUTES.ISSUER_DASHBOARD} 
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.ISSUER}>
                    <IssuerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path={ROUTES.INDIVIDUAL_DASHBOARD} 
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.INDIVIDUAL}>
                    <IndividualDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path={ROUTES.VERIFIER_DASHBOARD} 
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.VERIFIER}>
                    <VerifierDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Generic Dashboard Route - Redirects based on role */}
              <Route 
                path={ROUTES.DASHBOARD} 
                element={
                  <ProtectedRoute>
                    <DashboardRedirect user={user} />
                  </ProtectedRoute>
                } 
              />

              {/* Error Routes */}
              <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
              <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
              
              {/* Catch-all Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

// Dashboard Redirect Component
const DashboardRedirect = ({ user }) => {
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  switch (user.role) {
    case USER_ROLES.ISSUER:
      return <Navigate to={ROUTES.ISSUER_DASHBOARD} replace />;
    case USER_ROLES.INDIVIDUAL:
      return <Navigate to={ROUTES.INDIVIDUAL_DASHBOARD} replace />;
    case USER_ROLES.VERIFIER:
      return <Navigate to={ROUTES.VERIFIER_DASHBOARD} replace />;
    default:
      return <Navigate to={ROUTES.HOME} replace />;
  }
};

// Footer Component
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Document Verification System</h3>
          <p>Secure, AI-powered document verification platform</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href={ROUTES.HOME}>Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="/help">Help Center</a></li>
            <li><a href="/docs">Documentation</a></li>
            <li><a href="/api">API Reference</a></li>
            <li><a href="/status">System Status</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Connect</h4>
          <div className="social-links">
            <a href="#" aria-label="Twitter">🐦</a>
            <a href="#" aria-label="LinkedIn">💼</a>
            <a href="#" aria-label="GitHub">🐙</a>
            <a href="#" aria-label="Email">📧</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} Document Verification System. All rights reserved.</p>
        <p>
          Version 1.0.0 | 
          <a href="/terms"> Terms of Service</a> | 
          <a href="/privacy"> Privacy Policy</a>
        </p>
      </div>
    </footer>
  );
};

export default App;