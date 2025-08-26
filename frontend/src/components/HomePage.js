// frontend/src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
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
                Eliminate fraud, reduce processing time by 80%, and ensure complete security for your official documents.
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
                <Link to="/register" className="cta-button primary">
                  Get Started Free
                  <span className="button-icon">🚀</span>
                </Link>
                <Link to="/login" className="cta-button secondary">
                  Sign In
                  <span className="button-icon">👤</span>
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

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Why Choose DocVerify?</h2>
            <p className="section-description">
              Experience the future of document verification with cutting-edge technology
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon ai">🤖</div>
              <h3 className="feature-title">AI-Powered Verification</h3>
              <p className="feature-description">
                Advanced machine learning algorithms detect fraud and verify authenticity with 99.9% accuracy
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon blockchain">🔗</div>
              <h3 className="feature-title">Blockchain Security</h3>
              <p className="feature-description">
                Immutable, tamper-proof storage ensures your documents remain secure and verifiable forever
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon instant">⚡</div>
              <h3 className="feature-title">Instant Results</h3>
              <p className="feature-description">
                Get verification results in under 30 seconds, eliminating days of manual processing
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon multi">👥</div>
              <h3 className="feature-title">Multi-Stakeholder Platform</h3>
              <p className="feature-description">
                Seamless integration for issuers, individuals, and verifiers in one unified platform
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon global">🌍</div>
              <h3 className="feature-title">Global Compliance</h3>
              <p className="feature-description">
                GDPR compliant with international security standards and data protection regulations
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon api">🔧</div>
              <h3 className="feature-title">Easy Integration</h3>
              <p className="feature-description">
                RESTful APIs and comprehensive documentation for seamless system integration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="how-it-works-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              Simple, secure, and efficient document verification in three steps
            </p>
          </div>

          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Upload Document</h3>
                <p className="step-description">
                  Securely upload your document through our encrypted platform. 
                  We support multiple formats including PDF, JPG, and PNG.
                </p>
              </div>
              <div className="step-visual">
                <div className="upload-animation">📤</div>
              </div>
            </div>

            <div className="step-item reverse">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">AI Analysis</h3>
                <p className="step-description">
                  Our advanced AI engine analyzes your document for authenticity, 
                  checking signatures, seals, and content integrity.
                </p>
              </div>
              <div className="step-visual">
                <div className="analysis-animation">🔍</div>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Blockchain Certification</h3>
                <p className="step-description">
                  Verified documents are stored on blockchain with immutable 
                  certificates, ensuring permanent authenticity proof.
                </p>
              </div>
              <div className="step-visual">
                <div className="blockchain-animation">🛡️</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="user-types-section">
        <div className="user-types-container">
          <div className="section-header">
            <h2 className="section-title">Built for Everyone</h2>
            <p className="section-description">
              Tailored experiences for all stakeholders in the document verification ecosystem
            </p>
          </div>

          <div className="user-types-grid">
            <div className="user-type-card">
              <div className="user-type-icon">🏛️</div>
              <h3 className="user-type-title">Document Issuers</h3>
              <p className="user-type-description">
                Educational institutions, government agencies, and organizations issuing official documents
              </p>
              <ul className="user-type-features">
                <li>✅ Bulk document issuance</li>
                <li>✅ Digital certificate generation</li>
                <li>✅ Template standardization</li>
                <li>✅ Audit trail management</li>
              </ul>
              <Link to="/register" className="user-type-cta">
                Start Issuing →
              </Link>
            </div>

            <div className="user-type-card">
              <div className="user-type-icon">👤</div>
              <h3 className="user-type-title">Individuals</h3>
              <p className="user-type-description">
                Citizens and professionals who need secure access to their verified documents
              </p>
              <ul className="user-type-features">
                <li>✅ Personal document portfolio</li>
                <li>✅ Instant sharing capabilities</li>
                <li>✅ Verification history</li>
                <li>✅ Mobile accessibility</li>
              </ul>
              <Link to="/register" className="user-type-cta">
                Access Documents →
              </Link>
            </div>

            <div className="user-type-card">
              <div className="user-type-icon">🔍</div>
              <h3 className="user-type-title">Verifiers</h3>
              <p className="user-type-description">
                Banks, HR departments, and legal entities that need to verify document authenticity
              </p>
              <ul className="user-type-features">
                <li>✅ Real-time verification</li>
                <li>✅ Batch processing</li>
                <li>✅ API integration</li>
                <li>✅ Compliance reporting</li>
              </ul>
              <Link to="/register" className="user-type-cta">
                Start Verifying →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Revolutionize Document Verification?</h2>
            <p className="cta-description">
              Join thousands of organizations and individuals who trust DocVerify 
              for secure, fast, and reliable document verification.
            </p>
            
            <div className="cta-actions">
              <Link to="/register" className="cta-button primary large">
                Get Started Now
                <span className="button-icon">🚀</span>
              </Link>
              <div className="cta-info">
                <span>✅ Free to get started</span>
                <span>✅ No setup fees</span>
                <span>✅ 24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;