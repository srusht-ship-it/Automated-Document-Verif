import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleTryDashboard = () => {
    if (authService.isAuthenticated()) {
      const userRole = authService.getUserRole();
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
          navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="homepage">
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Secure Document Verification
                <span className="hero-highlight"> Made Simple</span>
              </h1>
              <p className="hero-description">
                Revolutionary AI-powered, blockchain-based platform for instant document verification. 
                Eliminate fraud, reduce processing time by 80%, and ensure complete security.
              </p>
              
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">99.9%</span>
                  <span className="stat-label">Accuracy</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">&lt;30s</span>
                  <span className="stat-label">Verification Time</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Secure</span>
                </div>
              </div>

              <div className="hero-actions">
                <button onClick={handleTryDashboard} className="cta-button primary">
                  Try Dashboard
                  <span className="button-icon">📊</span>
                </button>
                <Link to="/register" className="cta-button secondary">
                  Get Started Free
                  <span className="button-icon">🚀</span>
                </Link>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-card">
                <div className="document-preview">
                  <div className="document-header">
                    <div className="doc-icon">📄</div>
                    <div className="doc-info">
                      <span className="doc-title">Academic Certificate</span>
                      <span className="doc-status verified">✅ Verified</span>
                    </div>
                  </div>
                  <div className="verification-process">
                    <div className="process-step completed">
                      <span className="step-icon">🤖</span>
                      <span className="step-text">AI Analysis</span>
                    </div>
                    <div className="process-step completed">
                      <span className="step-icon">🔗</span>
                      <span className="step-text">Blockchain Verified</span>
                    </div>
                    <div className="process-step completed">
                      <span className="step-icon">🛡️</span>
                      <span className="step-text">Security Validated</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <div className="demo-container">
          <h2>Try Demo Accounts</h2>
          <div className="demo-accounts">
            <div className="demo-account">
              <h3>🏛️ Issuer</h3>
              <p>Issue and manage documents</p>
              <div className="demo-credentials">
                <small>issuer@demo.com / demo123</small>
              </div>
            </div>
            <div className="demo-account">
              <h3>👤 Individual</h3>
              <p>Upload and manage personal documents</p>
              <div className="demo-credentials">
                <small>individual@demo.com / demo123</small>
              </div>
            </div>
            <div className="demo-account">
              <h3>🔍 Verifier</h3>
              <p>Verify document authenticity</p>
              <div className="demo-credentials">
                <small>verifier@demo.com / demo123</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;