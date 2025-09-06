import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-brand">
            <h3>DocVerify</h3>
            <p>Secure blockchain-based document verification system</p>
          </div>
        </div>

        <div className="footer-section">
          <h4>Platform</h4>
          <ul>
            <li><a href="/upload">Upload Documents</a></li>
            <li><a href="/verify">Verify Documents</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/api-docs">API Documentation</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="/help">Help Center</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Connect</h4>
          <div className="social-links">
            <a href="#" className="social-link">📧</a>
            <a href="#" className="social-link">🐦</a>
            <a href="#" className="social-link">💼</a>
            <a href="#" className="social-link">📱</a>
          </div>
          <div className="security-badges">
            <span className="badge">🔒 SSL Secured</span>
            <span className="badge">⛓️ Blockchain Verified</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2024 DocVerify. All rights reserved.</p>
          <div className="footer-stats">
            <span>🔐 100% Secure</span>
            <span>⚡ 99.9% Uptime</span>
            <span>🌍 Global Access</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;