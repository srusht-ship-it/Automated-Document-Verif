// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import HomePage from './pages/HomePage';
import IssuerDashboard from './pages/IssuerDashboard';
import IndividualDashboard from './pages/IndividualDashboard';
import VerifierDashboard from './pages/VerifierDashboard';

// Services
import authService from './services/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        authService.setToken(token);
      } catch (error) {
        console.error('Error parsing user data:', error);
        handleLogout();
      }
    }
    setLoading(false);
  };

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    authService.setToken(token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Protected route component
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    return children;
  };

  // Dashboard router based on user role
  const getDashboardComponent = () => {
    if (!user) return <Navigate to="/login" replace />;
    
    switch (user.role) {
      case 'issuer':
        return <IssuerDashboard user={user} />;
      case 'individual':
        return <IndividualDashboard user={user} />;
      case 'verifier':
        return <VerifierDashboard user={user} />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar 
          isAuthenticated={isAuthenticated} 
          user={user} 
          onLogout={handleLogout} 
        />
        
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <HomePage />
              } 
            />
            
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Login onLogin={handleLogin} />
              } 
            />
            
            <Route 
              path="/register" 
              element={
                isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Register onRegister={handleLogin} />
              } 
            />

            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  {getDashboardComponent()}
                </ProtectedRoute>
              } 
            />

            {/* Role-specific protected routes */}
            <Route 
              path="/issuer/*" 
              element={
                <ProtectedRoute allowedRoles={['issuer']}>
                  <IssuerDashboard user={user} />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/individual/*" 
              element={
                <ProtectedRoute allowedRoles={['individual']}>
                  <IndividualDashboard user={user} />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/verifier/*" 
              element={
                <ProtectedRoute allowedRoles={['verifier']}>
                  <VerifierDashboard user={user} />
                </ProtectedRoute>
              } 
            />

            {/* Error routes */}
            <Route 
              path="/unauthorized" 
              element={
                <div className="error-page">
                  <h1>Access Denied</h1>
                  <p>You don't have permission to access this page.</p>
                </div>
              } 
            />
            
            <Route 
              path="*" 
              element={
                <div className="error-page">
                  <h1>Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;