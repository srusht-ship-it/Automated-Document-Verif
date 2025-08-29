// frontend/src/pages/IndividualDashboard.js
import React, { useState } from 'react';
import Dashboard from '../components/Dashboard';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import '../styles/IndividualDashboard.css';

const IndividualDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'upload', label: 'Upload Documents', icon: '📎' },
    { id: 'documents', label: 'My Documents', icon: '📄' },
    { id: 'verifications', label: 'Verifications', icon: '🔍' },
    { id: 'share', label: 'Share Documents', icon: '🔗' }
  ];

  const handleUploadSuccess = (uploadedDocuments) => {
    console.log('Documents uploaded successfully:', uploadedDocuments);
    // You could refresh the documents list or show a notification
  };

  const renderTabContent = () => {
    console.log('Active tab:', activeTab);
    switch (activeTab) {
      case 'overview':
        return <Dashboard />;
      case 'upload':
        return <DocumentUpload onUploadSuccess={handleUploadSuccess} />;
      case 'documents':
        return <DocumentList />;
      case 'verifications':
        return <VerificationHistory />;
      case 'share':
        return <ShareDocuments />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="individual-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <h3>Individual User</h3>
              <p>Document Owner</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                console.log('Clicking tab:', tab.id);
                setActiveTab(tab.id);
              }}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="dashboard-main">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Verification History Component
const VerificationHistory = () => {
  const [verifications, setVerifications] = useState([
    {
      id: 1,
      documentName: 'Degree Certificate.pdf',
      verifierName: 'ABC Corporation',
      verificationDate: '2024-01-20T10:30:00Z',
      status: 'verified',
      confidenceScore: 98,
      purpose: 'Employment Verification'
    },
    {
      id: 2,
      documentName: 'Passport.jpg',
      verifierName: 'Bank XYZ',
      verificationDate: '2024-01-19T14:15:00Z',
      status: 'verified',
      confidenceScore: 95,
      purpose: 'Account Opening'
    },
    {
      id: 3,
      documentName: 'Driver License.jpg',
      verifierName: 'Insurance Company',
      verificationDate: '2024-01-18T09:45:00Z',
      status: 'pending',
      confidenceScore: null,
      purpose: 'Policy Application'
    },
    {
      id: 4,
      documentName: 'Transcript.pdf',
      verifierName: 'University DEF',
      verificationDate: '2024-01-17T16:20:00Z',
      status: 'rejected',
      confidenceScore: 45,
      purpose: 'Admission Process'
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusConfig = (status, score) => {
    switch (status) {
      case 'verified':
        return { 
          icon: '✅', 
          class: 'verified', 
          text: `Verified (${score}%)`,
          color: '#10b981' 
        };
      case 'rejected':
        return { 
          icon: '❌', 
          class: 'rejected', 
          text: 'Rejected',
          color: '#ef4444' 
        };
      case 'pending':
        return { 
          icon: '⏳', 
          class: 'pending', 
          text: 'Pending',
          color: '#f59e0b' 
        };
      default:
                    return { 
                      icon: '❓', 
                      class: 'unknown', 
                      text: 'Unknown',
                      color: '#6b7280' 
                    };
                }
          };
        
          const filteredVerifications = filterStatus === 'all'
            ? verifications
            : verifications.filter(v => v.status === filterStatus);
        
          return (
            <div className="verification-history">
              <h2>Verification History</h2>
              <div className="filter-group">
                <label>Filter by Status:</label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <table className="verification-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Verifier</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVerifications.map(v => {
                    const statusConfig = getStatusConfig(v.status, v.confidenceScore);
                    return (
                      <tr key={v.id}>
                        <td>{v.documentName}</td>
                        <td>{v.verifierName}</td>
                        <td>{new Date(v.verificationDate).toLocaleString()}</td>
                        <td>
                          <span
                            className={`status-badge ${statusConfig.class}`}
                            style={{ color: statusConfig.color }}
                          >
                            {statusConfig.icon} {statusConfig.text}
                          </span>
                        </td>
                        <td>{v.purpose}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        };
        
        // Share Documents Component
        const ShareDocuments = () => {
          const [documents, setDocuments] = useState([
            {
              id: 1,
              name: 'Degree Certificate.pdf',
              type: 'Education',
              uploadDate: '2024-01-15',
              isShared: false,
              shareLink: null
            },
            {
              id: 2,
              name: 'Passport.jpg',
              type: 'Identity',
              uploadDate: '2024-01-10',
              isShared: true,
              shareLink: 'https://verify.app/share/abc123'
            }
          ]);
        
          const generateShareLink = (documentId) => {
            const shareLink = `https://verify.app/share/${Math.random().toString(36).substr(2, 9)}`;
            setDocuments(docs => 
              docs.map(doc => 
                doc.id === documentId 
                  ? { ...doc, isShared: true, shareLink }
                  : doc
              )
            );
          };
        
          const revokeShare = (documentId) => {
            setDocuments(docs => 
              docs.map(doc => 
                doc.id === documentId 
                  ? { ...doc, isShared: false, shareLink: null }
                  : doc
              )
            );
          };
        
          return (
            <div className="share-documents">
              <h2>Share Documents</h2>
              <p>Generate secure links to share your verified documents with third parties.</p>
              
              <div className="documents-grid">
                {documents.map(doc => (
                  <div key={doc.id} className="document-card">
                    <div className="document-info">
                      <h3>{doc.name}</h3>
                      <p>Type: {doc.type}</p>
                      <p>Uploaded: {doc.uploadDate}</p>
                    </div>
                    
                    <div className="share-actions">
                      {doc.isShared ? (
                        <div className="shared-info">
                          <p>✅ Shared</p>
                          <input 
                            type="text" 
                            value={doc.shareLink} 
                            readOnly 
                            className="share-link"
                          />
                          <button 
                            onClick={() => navigator.clipboard.writeText(doc.shareLink)}
                            className="copy-btn"
                          >
                            📋 Copy
                          </button>
                          <button 
                            onClick={() => revokeShare(doc.id)}
                            className="revoke-btn"
                          >
                            🚫 Revoke
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => generateShareLink(doc.id)}
                          className="share-btn"
                        >
                          🔗 Generate Share Link
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        };
        
        export default IndividualDashboard;
    