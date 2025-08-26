import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import '../styles/VerifierDashboard.css';

const VerifierDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('verify');
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [documentId, setDocumentId] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'verifier') {
      navigate('/login');
      return;
    }

    setUser(parsedUser);
    loadVerificationData();
  }, [navigate]);

  const loadVerificationData = async () => {
    try {
      // Mock data - replace with actual API calls
      setVerificationRequests([
        {
          id: 1,
          documentId: 'DOC001',
          issuer: 'State University',
          requestedBy: 'ABC Bank',
          requestDate: '2024-01-15',
          documentType: 'Degree Certificate',
          status: 'pending'
        },
        {
          id: 2,
          documentId: 'DOC002',
          issuer: 'City College',
          requestedBy: 'XYZ Corp HR',
          requestDate: '2024-01-14',
          documentType: 'Transcript',
          status: 'pending'
        }
      ]);

      setVerificationHistory([
        {
          id: 1,
          documentId: 'DOC003',
          issuer: 'Tech Institute',
          verifiedFor: 'DEF Company',
          verificationDate: '2024-01-10',
          result: 'verified',
          confidence: 98.5
        },
        {
          id: 2,
          documentId: 'DOC004',
          issuer: 'Business School',
          verifiedFor: 'GHI Bank',
          verificationDate: '2024-01-08',
          result: 'flagged',
          confidence: 65.2
        }
      ]);
    } catch (error) {
      console.error('Error loading verification data:', error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a JPEG, PNG, or PDF file.');
        return;
      }

      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB.');
        return;
      }

      setUploadedDocument(file);
      setVerificationResult(null);
    }
  };

  const verifyDocument = async () => {
    if (!uploadedDocument && !documentId.trim()) {
      alert('Please upload a document or enter a document ID.');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock verification result
      const mockResult = {
        status: Math.random() > 0.3 ? 'verified' : 'flagged',
        confidence: Math.round((Math.random() * 40 + 60) * 10) / 10,
        documentId: documentId || `DOC${Date.now()}`,
        issuer: 'Sample Institution',
        documentType: 'Certificate',
        issueDate: '2023-06-15',
        verificationDate: new Date().toISOString().split('T')[0],
        blockchainHash: '0x' + Math.random().toString(16).substr(2, 40),
        aiAnalysis: {
          textAccuracy: Math.round(Math.random() * 20 + 80),
          formatIntegrity: Math.round(Math.random() * 15 + 85),
          securityFeatures: Math.round(Math.random() * 25 + 75)
        }
      };

      setVerificationResult(mockResult);
    } catch (error) {
      console.error('Verification error:', error);
      alert('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRequest = async (requestId, action) => {
    try {
      // Update request status
      setVerificationRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: action === 'accept' ? 'processing' : 'rejected' }
            : req
        )
      );
      
      if (action === 'accept') {
        alert('Verification request accepted. Processing...');
      } else {
        alert('Verification request rejected.');
      }
    } catch (error) {
      console.error('Error handling request:', error);
    }
  };

  const clearVerification = () => {
    setUploadedDocument(null);
    setDocumentId('');
    setVerificationResult(null);
    document.getElementById('documentFile').value = '';
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Verifier Dashboard</h1>
          <p>Welcome, {user.name} | Verify document authenticity and manage verification requests</p>
        </div>
        <div className="user-info">
          <span className="user-role">Verifier</span>
          <span className="user-name">{user.name}</span>
        </div>
      </div>

      <div className="dashboard-nav">
        <button 
          className={`nav-btn ${activeTab === 'verify' ? 'active' : ''}`}
          onClick={() => setActiveTab('verify')}
        >
          <i className="icon">🔍</i>
          Verify Documents
        </button>
        <button 
          className={`nav-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <i className="icon">📋</i>
          Requests ({verificationRequests.length})
        </button>
        <button 
          className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <i className="icon">📊</i>
          History
        </button>
      </div>

      <div className="dashboard-content">
        {/* Verification Tab */}
        {activeTab === 'verify' && (
          <div className="tab-content">
            <div className="verification-section">
              <h2>Document Verification</h2>
              
              <div className="verification-input">
                <div className="input-methods">
                  <div className="method-card">
                    <h3>Upload Document</h3>
                    <div className="file-upload">
                      <input 
                        type="file" 
                        id="documentFile"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="documentFile" className="upload-label">
                        {uploadedDocument ? uploadedDocument.name : 'Choose file to verify'}
                      </label>
                    </div>
                  </div>

                  <div className="method-divider">OR</div>

                  <div className="method-card">
                    <h3>Enter Document ID</h3>
                    <input 
                      type="text" 
                      placeholder="Enter document ID (e.g., DOC001)"
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      className="document-id-input"
                    />
                  </div>
                </div>

                <div className="verification-actions">
                  <button 
                    onClick={verifyDocument} 
                    disabled={isVerifying || (!uploadedDocument && !documentId.trim())}
                    className="verify-btn"
                  >
                    {isVerifying ? (
                      <>
                        <span className="spinner"></span>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <i className="icon">🔍</i>
                        Verify Document
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={clearVerification} 
                    className="clear-btn"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Verification Result */}
              {verificationResult && (
                <div className={`verification-result ${verificationResult.status}`}>
                  <div className="result-header">
                    <div className="result-status">
                      <i className={`status-icon ${verificationResult.status === 'verified' ? '✅' : '⚠️'}`}></i>
                      <span className="status-text">
                        {verificationResult.status === 'verified' ? 'Document Verified' : 'Document Flagged'}
                      </span>
                    </div>
                    <div className="confidence-score">
                      Confidence: {verificationResult.confidence}%
                    </div>
                  </div>

                  <div className="result-details">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="label">Document ID:</span>
                        <span className="value">{verificationResult.documentId}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Issuer:</span>
                        <span className="value">{verificationResult.issuer}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Document Type:</span>
                        <span className="value">{verificationResult.documentType}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Issue Date:</span>
                        <span className="value">{verificationResult.issueDate}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Blockchain Hash:</span>
                        <span className="value hash">{verificationResult.blockchainHash}</span>
                      </div>
                    </div>

                    <div className="ai-analysis">
                      <h4>AI Analysis</h4>
                      <div className="analysis-metrics">
                        <div className="metric">
                          <span>Text Accuracy:</span>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{width: `${verificationResult.aiAnalysis.textAccuracy}%`}}
                            ></div>
                          </div>
                          <span>{verificationResult.aiAnalysis.textAccuracy}%</span>
                        </div>
                        <div className="metric">
                          <span>Format Integrity:</span>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{width: `${verificationResult.aiAnalysis.formatIntegrity}%`}}
                            ></div>
                          </div>
                          <span>{verificationResult.aiAnalysis.formatIntegrity}%</span>
                        </div>
                        <div className="metric">
                          <span>Security Features:</span>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{width: `${verificationResult.aiAnalysis.securityFeatures}%`}}
                            ></div>
                          </div>
                          <span>{verificationResult.aiAnalysis.securityFeatures}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="tab-content">
            <h2>Verification Requests</h2>
            {verificationRequests.length === 0 ? (
              <div className="empty-state">
                <i className="empty-icon">📋</i>
                <h3>No Pending Requests</h3>
                <p>Verification requests will appear here when received.</p>
              </div>
            ) : (
              <div className="requests-list">
                {verificationRequests.map(request => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <div className="request-info">
                        <h3>Document ID: {request.documentId}</h3>
                        <p className="request-details">
                          <span>From: {request.requestedBy}</span>
                          <span>Date: {request.requestDate}</span>
                        </p>
                      </div>
                      <div className={`request-status ${request.status}`}>
                        {request.status}
                      </div>
                    </div>
                    
                    <div className="request-body">
                      <div className="request-meta">
                        <span><strong>Issuer:</strong> {request.issuer}</span>
                        <span><strong>Type:</strong> {request.documentType}</span>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="request-actions">
                          <button 
                            onClick={() => handleRequest(request.id, 'accept')}
                            className="accept-btn"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleRequest(request.id, 'reject')}
                            className="reject-btn"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="tab-content">
            <h2>Verification History</h2>
            {verificationHistory.length === 0 ? (
              <div className="empty-state">
                <i className="empty-icon">📊</i>
                <h3>No History Yet</h3>
                <p>Your verification history will appear here.</p>
              </div>
            ) : (
              <div className="history-list">
                {verificationHistory.map(record => (
                  <div key={record.id} className="history-card">
                    <div className="history-header">
                      <div className="history-info">
                        <h3>Document ID: {record.documentId}</h3>
                        <p>Verified for: {record.verifiedFor}</p>
                      </div>
                      <div className={`verification-result-badge ${record.result}`}>
                        <i className={record.result === 'verified' ? '✅' : '⚠️'}></i>
                        {record.result}
                      </div>
                    </div>
                    
                    <div className="history-details">
                      <div className="detail-row">
                        <span>Issuer:</span>
                        <span>{record.issuer}</span>
                      </div>
                      <div className="detail-row">
                        <span>Date:</span>
                        <span>{record.verificationDate}</span>
                      </div>
                      <div className="detail-row">
                        <span>Confidence:</span>
                        <span className="confidence">{record.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifierDashboard;