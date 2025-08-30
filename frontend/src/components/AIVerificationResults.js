import React, { useState } from 'react';
import '../styles/AIVerificationResults.css';

const AIVerificationResults = ({ verificationData, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!verificationData) return null;

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return '#22c55e';
    if (confidence >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getRiskLevel = (confidence) => {
    if (confidence >= 90) return 'Low Risk';
    if (confidence >= 70) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div className="ai-verification-overlay">
      <div className="ai-verification-modal">
        <div className="modal-header">
          <h2>AI Verification Results</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="verification-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            🔍 Analysis
          </button>
          <button 
            className={`tab-btn ${activeTab === 'blockchain' ? 'active' : ''}`}
            onClick={() => setActiveTab('blockchain')}
          >
            ⛓️ Blockchain
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="confidence-meter">
                <div className="meter-container">
                  <div 
                    className="confidence-circle"
                    style={{ 
                      background: `conic-gradient(${getConfidenceColor(verificationData.confidence)} ${verificationData.confidence * 3.6}deg, #e5e7eb 0deg)` 
                    }}
                  >
                    <div className="confidence-inner">
                      <span className="confidence-value">{verificationData.confidence}%</span>
                      <span className="confidence-label">Confidence</span>
                    </div>
                  </div>
                </div>
                <div className="risk-assessment">
                  <span className="risk-label">Risk Level:</span>
                  <span 
                    className="risk-value"
                    style={{ color: getConfidenceColor(verificationData.confidence) }}
                  >
                    {getRiskLevel(verificationData.confidence)}
                  </span>
                </div>
              </div>

              <div className="verification-summary">
                <div className="summary-item">
                  <span className="summary-icon">📄</span>
                  <div className="summary-content">
                    <h4>Document Status</h4>
                    <p className={`status ${verificationData.status}`}>
                      {verificationData.status === 'verified' ? '✅ Verified' : '⚠️ Flagged'}
                    </p>
                  </div>
                </div>

                <div className="summary-item">
                  <span className="summary-icon">🏛️</span>
                  <div className="summary-content">
                    <h4>Issuing Authority</h4>
                    <p>{verificationData.issuer}</p>
                  </div>
                </div>

                <div className="summary-item">
                  <span className="summary-icon">📅</span>
                  <div className="summary-content">
                    <h4>Issue Date</h4>
                    <p>{verificationData.issueDate}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="analysis-tab">
              <h3>AI Analysis Breakdown</h3>
              
              <div className="analysis-metrics">
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-icon">📝</span>
                    <h4>Text Analysis</h4>
                  </div>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill"
                      style={{ 
                        width: `${verificationData.aiAnalysis.textAccuracy}%`,
                        backgroundColor: getConfidenceColor(verificationData.aiAnalysis.textAccuracy)
                      }}
                    ></div>
                  </div>
                  <div className="metric-details">
                    <span>{verificationData.aiAnalysis.textAccuracy}% Accuracy</span>
                    <span className="metric-status">
                      {verificationData.aiAnalysis.textAccuracy >= 85 ? '✅ Pass' : '⚠️ Review'}
                    </span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-icon">🎨</span>
                    <h4>Format Integrity</h4>
                  </div>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill"
                      style={{ 
                        width: `${verificationData.aiAnalysis.formatIntegrity}%`,
                        backgroundColor: getConfidenceColor(verificationData.aiAnalysis.formatIntegrity)
                      }}
                    ></div>
                  </div>
                  <div className="metric-details">
                    <span>{verificationData.aiAnalysis.formatIntegrity}% Integrity</span>
                    <span className="metric-status">
                      {verificationData.aiAnalysis.formatIntegrity >= 85 ? '✅ Pass' : '⚠️ Review'}
                    </span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-icon">🔒</span>
                    <h4>Security Features</h4>
                  </div>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill"
                      style={{ 
                        width: `${verificationData.aiAnalysis.securityFeatures}%`,
                        backgroundColor: getConfidenceColor(verificationData.aiAnalysis.securityFeatures)
                      }}
                    ></div>
                  </div>
                  <div className="metric-details">
                    <span>{verificationData.aiAnalysis.securityFeatures}% Secure</span>
                    <span className="metric-status">
                      {verificationData.aiAnalysis.securityFeatures >= 85 ? '✅ Pass' : '⚠️ Review'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="fraud-indicators">
                <h4>Fraud Detection</h4>
                <div className="indicators-grid">
                  <div className="indicator">
                    <span className="indicator-icon">🔍</span>
                    <span>Tampering Detection</span>
                    <span className="indicator-status pass">✅ Clear</span>
                  </div>
                  <div className="indicator">
                    <span className="indicator-icon">📊</span>
                    <span>Statistical Analysis</span>
                    <span className="indicator-status pass">✅ Normal</span>
                  </div>
                  <div className="indicator">
                    <span className="indicator-icon">🎯</span>
                    <span>Pattern Matching</span>
                    <span className="indicator-status pass">✅ Match</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blockchain' && (
            <div className="blockchain-tab">
              <h3>Blockchain Verification</h3>
              
              <div className="blockchain-info">
                <div className="blockchain-item">
                  <span className="blockchain-label">Transaction Hash:</span>
                  <span className="blockchain-value hash">{verificationData.blockchainHash}</span>
                </div>
                
                <div className="blockchain-item">
                  <span className="blockchain-label">Block Number:</span>
                  <span className="blockchain-value">#1,234,567</span>
                </div>
                
                <div className="blockchain-item">
                  <span className="blockchain-label">Network:</span>
                  <span className="blockchain-value">Ethereum Mainnet</span>
                </div>
                
                <div className="blockchain-item">
                  <span className="blockchain-label">Confirmations:</span>
                  <span className="blockchain-value">156 confirmations</span>
                </div>
              </div>

              <div className="blockchain-timeline">
                <h4>Verification Timeline</h4>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h5>Document Created</h5>
                      <p>{verificationData.issueDate}</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h5>Blockchain Registration</h5>
                      <p>{verificationData.issueDate}</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot active"></div>
                    <div className="timeline-content">
                      <h5>Verification Request</h5>
                      <p>{verificationData.verificationDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary">
            📄 Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIVerificationResults;