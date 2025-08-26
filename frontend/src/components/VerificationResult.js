// frontend/src/components/VerificationResult.js
import React, { useState, useEffect } from 'react';
import '../styles/VerificationResult.css';

const VerificationResult = ({ verificationId, onClose }) => {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (verificationId) {
      loadVerificationResult();
    }
  }, [verificationId]);

  const loadVerificationResult = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/verifications/${verificationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVerification(data.verification);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to load verification result');
      }
    } catch (error) {
      console.error('Error loading verification:', error);
      setError('Failed to load verification result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatusConfig = (status, confidenceScore) => {
    if (status === 'verified' && confidenceScore >= 95) {
      return {
        icon: '✅',
        title: 'Document Verified',
        subtitle: 'High Confidence',
        class: 'verified-high',
        color: '#10B981'
      };
    } else if (status === 'verified' && confidenceScore >= 80) {
      return {
        icon: '✅',
        title: 'Document Verified',
        subtitle: 'Medium Confidence',
        class: 'verified-medium',
        color: '#F59E0B'
      };
    } else if (status === 'verified' && confidenceScore < 80) {
      return {
        icon: '⚠️',
        title: 'Document Verified',
        subtitle: 'Low Confidence',
        class: 'verified-low',
        color: '#F59E0B'
      };
    } else if (status === 'rejected') {
      return {
        icon: '❌',
        title: 'Document Rejected',
        subtitle: 'Failed Verification',
        class: 'rejected',
        color: '#EF4444'
      };
    } else if (status === 'processing') {
      return {
        icon: '🔄',
        title: 'Processing',
        subtitle: 'Verification in Progress',
        class: 'processing',
        color: '#6366F1'
      };
    } else {
      return {
        icon: '⏳',
        title: 'Pending',
        subtitle: 'Awaiting Verification',
        class: 'pending',
        color: '#6B7280'
      };
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 95) return '#10B981'; // Green
    if (score >= 80) return '#F59E0B'; // Yellow
    if (score >= 60) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadVerificationReport = () => {
    // Mock download functionality - would generate actual PDF report
    const reportData = {
      verificationId: verification.id,
      documentName: verification.document?.originalName || 'Unknown Document',
      status: verification.status,
      confidenceScore: verification.confidenceScore,
      verificationDate: verification.verificationDate,
      verifiedBy: verification.verifiedBy,
      checks: verification.checks || []
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification-report-${verification.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="verification-result-loading">
        <div className="loading-spinner"></div>
        <p>Loading verification result...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="verification-result-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Results</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={loadVerificationResult}>
          Try Again
        </button>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="verification-result-empty">
        <div className="empty-icon">📄</div>
        <h3>No Verification Found</h3>
        <p>The requested verification could not be found.</p>
      </div>
    );
  }

  const statusConfig = getVerificationStatusConfig(verification.status, verification.confidenceScore);

  return (
    <div className="verification-result">
      <div className="verification-header">
        <div className={`status-indicator ${statusConfig.class}`}>
          <div className="status-icon">{statusConfig.icon}</div>
          <div className="status-text">
            <h2>{statusConfig.title}</h2>
            <p>{statusConfig.subtitle}</p>
          </div>
        </div>
        
        {onClose && (
          <button className="close-btn" onClick={onClose}>×</button>
        )}
      </div>

      <div className="verification-content">
        {/* Document Information */}
        <div className="verification-section">
          <h3>Document Information</h3>
          <div className="document-info-grid">
            <div className="info-item">
              <span className="info-label">Document Name:</span>
              <span className="info-value">{verification.document?.originalName || 'Unknown Document'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Document Type:</span>
              <span className="info-value">{verification.document?.mimeType || 'Unknown'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Document Hash:</span>
              <span className="info-value hash-value">{verification.document?.fileHash || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Upload Date:</span>
              <span className="info-value">
                {verification.document?.uploadDate ? formatDateTime(verification.document.uploadDate) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Details */}
        <div className="verification-section">
          <h3>Verification Details</h3>
          <div className="verification-details-grid">
            <div className="detail-card">
              <div className="detail-header">
                <span className="detail-icon">🎯</span>
                <span className="detail-title">Confidence Score</span>
              </div>
              <div className="confidence-score">
                <div className="score-circle">
                  <svg viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={getConfidenceColor(verification.confidenceScore || 0)}
                      strokeWidth="8"
                      strokeDasharray={`${(verification.confidenceScore || 0) * 2.51} 251`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="score-text">{verification.confidenceScore || 0}%</div>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-header">
                <span className="detail-icon">👤</span>
                <span className="detail-title">Verified By</span>
              </div>
              <div className="detail-content">
                <p>{verification.verifiedBy || 'System Auto-Verification'}</p>
                <small>{verification.verifierRole || 'Automated System'}</small>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-header">
                <span className="detail-icon">📅</span>
                <span className="detail-title">Verification Date</span>
              </div>
              <div className="detail-content">
                <p>{formatDateTime(verification.verificationDate || verification.createdAt)}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-header">
                <span className="detail-icon">🔒</span>
                <span className="detail-title">Verification Method</span>
              </div>
              <div className="detail-content">
                <p>{verification.verificationMethod || 'AI-Powered Analysis'}</p>
                <small>OCR + Pattern Recognition</small>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Checks */}
        {verification.checks && verification.checks.length > 0 && (
          <div className="verification-section">
            <h3>Verification Checks</h3>
            <div className="checks-list">
              {verification.checks.map((check, index) => (
                <div key={index} className={`check-item ${check.passed ? 'passed' : 'failed'}`}>
                  <div className="check-icon">
                    {check.passed ? '✅' : '❌'}
                  </div>
                  <div className="check-content">
                    <div className="check-name">{check.name}</div>
                    <div className="check-description">{check.description}</div>
                    {check.confidence && (
                      <div className="check-confidence">Confidence: {check.confidence}%</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Information */}
        {verification.additionalInfo && (
          <div className="verification-section">
            <h3>Additional Information</h3>
            <div className="additional-info">
              <p>{verification.additionalInfo}</p>
            </div>
          </div>
        )}

        {/* Blockchain Verification (Future Feature) */}
        <div className="verification-section">
          <h3>Blockchain Verification</h3>
          <div className="blockchain-info">
            <div className="blockchain-status">
              <span className="blockchain-icon">⛓️</span>
              <span className="blockchain-text">
                {verification.blockchainHash ? 'Recorded on Blockchain' : 'Pending Blockchain Recording'}
              </span>
            </div>
            {verification.blockchainHash && (
              <div className="blockchain-hash">
                <span className="hash-label">Transaction Hash:</span>
                <span className="hash-value">{verification.blockchainHash}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="verification-actions">
        <button className="action-btn primary" onClick={downloadVerificationReport}>
          📥 Download Report
        </button>
        
        <button className="action-btn secondary" onClick={() => window.print()}>
          🖨️ Print Result
        </button>
        
        {verification.shareableLink && (
          <button 
            className="action-btn tertiary"
            onClick={() => {
              navigator.clipboard.writeText(verification.shareableLink);
              alert('Verification link copied to clipboard!');
            }}
          >
            🔗 Share Verification
          </button>
        )}
      </div>
    </div>
  );
};

export default VerificationResult;