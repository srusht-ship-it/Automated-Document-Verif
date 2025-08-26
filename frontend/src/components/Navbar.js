// frontend/src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isAuthenticated, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    onLogout();
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'issuer': 'Document Issuer',
      'individual': 'Individual User',
      'verifier': 'Document Verifier'
    };
    return roleNames[role] || role;
  };

  const getRoleIcon = (role) => {
    const roleIcons = {
      'issuer': '🏛️',
      'individual': '👤',
      'verifier': '🔍'
    };
    return roleIcons[role] || '👤';
  };

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Brand */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <div className="brand-icon">📄</div>
            <span className="brand-text">DocVerify</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-menu">
          {!isAuthenticated ? (
            // Public Navigation
            <div className="navbar-nav">
              <Link 
                to="/" 
                className={`nav-link ${isActiveRoute('/') && !isActiveRoute('/login') && !isActiveRoute('/register') ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link 
                to="/login" 
                className={`nav-link ${isActiveRoute('/login') ? 'active' : ''}`}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className={`nav-link nav-link-primary ${isActiveRoute('/register') ? 'active' : ''}`}
              >
                Get Started
              </Link>
            </div>
          ) : (
            // Authenticated Navigation
            <div className="navbar-nav">
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              
              {/* Role-specific navigation */}
              {user?.role === 'issuer' && (
                <Link 
                  to="/issuer" 
                  className={`nav-link ${isActiveRoute('/issuer') ? 'active' : ''}`}
                >
                  Issue Documents
                </Link>
              )}
              
              {user?.role === 'individual' && (
                <Link 
                  to="/individual" 
                  className={`nav-link ${isActiveRoute('/individual') ? 'active' : ''}`}
                >
                  My Documents
                </Link>
              )}
              
              {user?.role === 'verifier' && (
                <Link 
                  to="/verifier" 
                  className={`nav-link ${isActiveRoute('/verifier') ? 'active' : ''}`}
                >
                  Verify Documents
                </Link>
              )}

              {/* User Profile Dropdown */}
              <div className="user-menu">
                <div className="user-info">
                  <div className="user-avatar">
                    {getRoleIcon(user?.role)}
                  </div>
                  <div className="user-details">
                    <span className="user-name">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="user-role">
                      {getRoleDisplayName(user?.role)}
                    </span>
                  </div>
                </div>
                <button 
                  className="logout-button"
                  onClick={handleLogout}
                  title="Sign Out"
                >
                  🚪
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-button ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        {!isAuthenticated ? (
          // Public Mobile Navigation
          <div className="mobile-nav">
            <Link 
              to="/" 
              className={`mobile-nav-link ${isActiveRoute('/') && !isActiveRoute('/login') && !isActiveRoute('/register') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-nav-icon">🏠</span>
              Home
            </Link>
            <Link 
              to="/login" 
              className={`mobile-nav-link ${isActiveRoute('/login') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-nav-icon">🔐</span>
              Sign In
            </Link>
            <Link 
              to="/register" 
              className={`mobile-nav-link ${isActiveRoute('/register') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-nav-icon">✨</span>
              Get Started
            </Link>
          </div>
        ) : (
          // Authenticated Mobile Navigation
          <div className="mobile-nav">
            {/* User Info */}
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">
                {getRoleIcon(user?.role)}
              </div>
              <div className="mobile-user-details">
                <span className="mobile-user-name">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="mobile-user-role">
                  {getRoleDisplayName(user?.role)}
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <Link 
              to="/dashboard" 
              className={`mobile-nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-nav-icon">📊</span>
              Dashboard
            </Link>
            
            {/* Role-specific mobile navigation */}
            {user?.role === 'issuer' && (
              <Link 
                to="/issuer" 
                className={`mobile-nav-link ${isActiveRoute('/issuer') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mobile-nav-icon">📝</span>
                Issue Documents
              </Link>
            )}
            
            {user?.role === 'individual' && (
              <Link 
                to="/individual" 
                className={`mobile-nav-link ${isActiveRoute('/individual') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mobile-nav-icon">📁</span>
                My Documents
              </Link>
            )}
            
            {user?.role === 'verifier' && (
              <Link 
                to="/verifier" 
                className={`mobile-nav-link ${isActiveRoute('/verifier') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mobile-nav-icon">🔍</span>
                Verify Documents
              </Link>
            )}

            {/* Logout Button */}
            <button 
              className="mobile-logout-button"
              onClick={handleLogout}
            >
              <span className="mobile-nav-icon">🚪</span>
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;