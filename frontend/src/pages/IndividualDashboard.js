import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SidebarNavigation from '../components/SidebarNavigation';
import HeaderBar from '../components/HeaderBar';
import StatsCards from '../components/StatsCards';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import '../styles/IndividualDashboard.css';
import '../styles/theme.css';

const IndividualDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('doc_verify_token');
      const response = await fetch('http://localhost:5000/api/documents/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (results) => {
    console.log('Upload successful:', results);
    alert(`Successfully uploaded ${results.length} file(s)!`);
    // Refresh stats and documents after upload
    fetchStats();
    setRefreshTrigger(prev => prev + 1);
    // Switch to documents tab to show uploaded files
    setTimeout(() => setActiveTab('documents'), 1000);
  };

  const user = JSON.parse(localStorage.getItem('doc_verify_user') || '{}');

  return (
    <div className="app-layout">
      <SidebarNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userRole={user.role || 'individual'} 
      />
      
      <div className="main-content with-sidebar">
        <HeaderBar 
          title="Individual Dashboard" 
          subtitle="Manage your documents and verification history" 
        />
        
        <main className="content-area with-header">
          <div className="content-wrapper">
            {activeTab === 'overview' && (
              <div className="tab-content">
                <h2 className="section-title">Dashboard Overview</h2>
                <StatsCards userRole={user.role || 'individual'} />
                <div className="card demo-info">
                  <h3>Demo Account Information</h3>
                  <div className="demo-details">
                    <p><strong>📧 Email:</strong> individual@demo.com</p>
                    <p><strong>🔑 Password:</strong> demo123</p>
                    <p><strong>👤 Role:</strong> Individual User</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="tab-content">
                <h2 className="section-title">Upload Documents</h2>
                <div className="card">
                  <DocumentUpload onUploadSuccess={handleUploadSuccess} />
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="tab-content">
                <h2 className="section-title">My Documents</h2>
                <div className="documents-section">
                  <div className="documents-header">
                    <p>View and manage all your uploaded documents</p>
                    <button 
                      onClick={() => setRefreshTrigger(prev => prev + 1)}
                      className="btn btn-secondary"
                      style={{ marginLeft: 'auto' }}
                    >
                      🔄 Refresh
                    </button>
                  </div>
                  <DocumentList key={refreshTrigger} />
                </div>
              </div>
            )}

            {activeTab === 'verification' && (
              <VerificationHistory />
            )}

            {activeTab === 'share' && (
              <ShareDocuments refreshTrigger={refreshTrigger} />
            )}

            {activeTab === 'profile' && (
              <ProfileManagement />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Verification History Component
const VerificationHistory = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchVerificationHistory();
  }, []);

  const fetchVerificationHistory = async () => {
    try {
      const token = localStorage.getItem('doc_verify_token');
      const response = await fetch('http://localhost:5000/api/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transform documents into verification history
        const history = data.data.documents.map(doc => ({
          id: doc.id,
          documentName: doc.originalName,
          status: doc.status,
          uploadDate: doc.uploadedAt,
          documentType: doc.documentType,
          verifier: doc.issuer?.name || 'System'
        }));
        setVerifications(history);
      }
    } catch (error) {
      console.error('Error fetching verification history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVerifications = verifications.filter(v => 
    filter === 'all' || v.status === filter
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      default: return '📄';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="tab-content">
      <h2>Verification History</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: '500' }}>Filter by status:</label>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="all">All Documents</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : filteredVerifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <h3>No verification history</h3>
          <p>Upload documents to see their verification status here.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {filteredVerifications.map((verification, index) => (
            <div key={verification.id} style={{
              padding: '16px',
              borderBottom: index < filteredVerifications.length - 1 ? '1px solid #f0f0f0' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  {getStatusIcon(verification.status)} {verification.documentName}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Type: {verification.documentType} • Uploaded: {new Date(verification.uploadDate).toLocaleDateString()}
                </div>
              </div>
              <div style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                color: getStatusColor(verification.status),
                background: `${getStatusColor(verification.status)}20`
              }}>
                {verification.status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Share Documents Component
const ShareDocuments = ({ refreshTrigger }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareLinks, setShareLinks] = useState({});

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('doc_verify_token');
      const response = await fetch('http://localhost:5000/api/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.data.documents.filter(doc => doc.status === 'verified'));
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateShareLink = (documentId) => {
    const shareLink = `${window.location.origin}/verify/${documentId}?token=${Math.random().toString(36).substr(2, 16)}`;
    setShareLinks(prev => ({ ...prev, [documentId]: shareLink }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Share link copied to clipboard!');
    });
  };

  const revokeShare = (documentId) => {
    setShareLinks(prev => {
      const updated = { ...prev };
      delete updated[documentId];
      return updated;
    });
  };

  return (
    <div className="tab-content">
      <h2>Share Documents</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Generate secure links to share your verified documents with third parties.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔗</div>
          <h3>No verified documents to share</h3>
          <p>Only verified documents can be shared with others.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {documents.map(doc => (
            <div key={doc.id} style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                  📄 {doc.originalName}
                </h4>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Type: {doc.documentType} • ✅ Verified
                </div>
              </div>

              {shareLinks[doc.id] ? (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Share Link:
                    </label>
                    <input
                      type="text"
                      value={shareLinks[doc.id]}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: '#f8f9fa'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => copyToClipboard(shareLinks[doc.id])}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      📋 Copy Link
                    </button>
                    <button
                      onClick={() => revokeShare(doc.id)}
                      style={{
                        padding: '8px 12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      🚫 Revoke
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => generateShareLink(doc.id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  🔗 Generate Share Link
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Profile Management Component
const ProfileManagement = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = () => {
    const userData = localStorage.getItem('doc_verify_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        email: parsedUser.email || '',
        organization: parsedUser.organization || ''
      });
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('doc_verify_token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = { ...user, ...data.data };
        localStorage.setItem('doc_verify_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update profile: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('doc_verify_token');
      localStorage.removeItem('doc_verify_user');
      window.location.href = '/';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div className="tab-content">
      <h2>Profile Management</h2>
      
      <div style={{ maxWidth: '500px' }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '20px' }}>Personal Information</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>First Name:</label>
            {editing ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            ) : (
              <div style={{ padding: '8px', background: '#f8f9fa', borderRadius: '4px' }}>
                {user?.firstName || 'Not set'}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Last Name:</label>
            {editing ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            ) : (
              <div style={{ padding: '8px', background: '#f8f9fa', borderRadius: '4px' }}>
                {user?.lastName || 'Not set'}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Email:</label>
            <div style={{ padding: '8px', background: '#f8f9fa', borderRadius: '4px', color: '#666' }}>
              {user?.email} (cannot be changed)
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Organization:</label>
            {editing ? (
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            ) : (
              <div style={{ padding: '8px', background: '#f8f9fa', borderRadius: '4px' }}>
                {user?.organization || 'Not set'}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '10px 20px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ✅ Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    loadUserProfile();
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '10px 20px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '16px' }}>Account Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '4px', fontSize: '14px' }}>
              🔒 <strong>Account Type:</strong> {user?.role || 'Individual'}
            </div>
            <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '4px', fontSize: '14px' }}>
              📅 <strong>Member Since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '12px 20px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualDashboard;