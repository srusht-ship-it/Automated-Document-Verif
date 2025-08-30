import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import IndividualDashboard from './pages/IndividualDashboard';
import IssuerDashboard from './pages/IssuerDashboard';
import VerifierDashboard from './pages/VerifierDashboard';
import UploadPage from './pages/UploadPage';

import authService from './services/auth';
import './App.css';
import './styles/theme.css';

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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const handleLogin = (token, user) => {
    localStorage.setItem('doc_verify_token', token);
    localStorage.setItem('doc_verify_user', JSON.stringify(user));
    authService.setToken(token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                  <Navigate to="/" replace /> : 
                  <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? 
                  <Navigate to="/" replace /> : 
                  <Register />
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
              path="/issuer-dashboard"
              element={
                <ProtectedRoute allowedRoles={['issuer']}>
                  <IssuerDashboard />
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </div>
    </Router>
  );
}

export default App;