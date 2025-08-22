// frontend/src/components/DocumentList.js
import React, { useState, useEffect } from 'react';
import '../styles/DocumentList.css';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to load documents');
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (mimeType) => {
    if (!mimeType) return '📄';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    return '📄';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { icon: '⏳', text: 'Pending', class: 'pending' },
      'verified': { icon: '✅', text: 'Verified', class: 'verified' },
      'rejected': { icon: '❌', text: 'Rejected', class: 'rejected' },
      'processing': { icon: '🔄', text: 'Processing', class: 'processing' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const filteredAndSortedDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.extractedText?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || 
                         (filterType === 'pdf' && doc.mimeType?.includes('pdf')) ||
                         (filterType === 'image' && doc.mimeType?.includes('image'));
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'uploadDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const downloadDocument = async (documentId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download document');
      }
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download document');
    }
  };

  const shareDocument = (document) => {
    // Mock share functionality - would integrate with actual sharing system
    const shareData = {
      title: document.originalName,
      text: `Sharing document: ${document.originalName}`,
      url: `${window.location.origin}/documents/${document.id}/verify`
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url).then(() => {
        alert('Share link copied to clipboard!');
      });
    }
  };

  const viewDocument = (document) => {
    setSelectedDocument(document);
  };

  const closeModal = () => {
    setSelectedDocument(null);
  };

  if (loading) {
    return (
      <div className="document-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading your documents...</p>
      </div>
    );
  }

  return (
    <div className="document-list">
      <div className="document-list-header">
        <h2>My Documents</h2>
        <p>Manage and view all your uploaded documents</p>
      </div>

      <div className="document-controls">
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="filter-section">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF Documents</option>
            <option value="image">Images</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="uploadDate">Upload Date</option>
            <option value="originalName">Name</option>
            <option value="fileSize">File Size</option>
          </select>

          <button 
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="document-stats">
        <div className="stat-item">
          <span className="stat-number">{documents.length}</span>
          <span className="stat-label">Total Documents</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{documents.filter(d => d.verificationStatus === 'verified').length}</span>
          <span className="stat-label">Verified</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{documents.filter(d => d.verificationStatus === 'pending').length}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>

      {filteredAndSortedDocuments.length === 0 ? (
        <div className="no-documents">
          <div className="no-documents-icon">📄</div>
          <h3>No documents found</h3>
          <p>
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start by uploading your first document'
            }
          </p>
          {!searchTerm && filterType === 'all' && (
            <button className="upload-first-btn" onClick={() => window.location.href = '/documents/upload'}>
              📤 Upload Document
            </button>
          )}
        </div>
      ) : (
        <div className="documents-grid">
          {filteredAndSortedDocuments.map((document) => (
            <div key={document.id} className="document-card">
              <div className="document-card-header">
                <div className="document-icon">
                  {getFileTypeIcon(document.mimeType)}
                </div>
                <div className="document-status">
                  {getStatusBadge(document.verificationStatus || 'pending')}
                </div>
              </div>

              <div className="document-info">
                <h3 className="document-name" title={document.originalName}>
                  {document.originalName || 'Unknown Document'}
                </h3>
                
                <div className="document-metadata">
                  <div className="metadata-item">
                    <span className="metadata-label">Size:</span>
                    <span className="metadata-value">{formatFileSize(document.fileSize)}</span>
                  </div>
                  
                  <div className="metadata-item">
                    <span className="metadata-label">Uploaded:</span>
                    <span className="metadata-value">
                      {new Date(document.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {document.extractedText && (
                    <div className="metadata-item">
                      <span className="metadata-label">Text Extracted:</span>
                      <span className="metadata-value">Yes</span>
                    </div>
                  )}
                </div>

                {document.extractedText && (
                  <div className="document-preview">
                    <p>{document.extractedText.substring(0, 150)}...</p>
                  </div>
                )}
              </div>

              <div className="document-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => viewDocument(document)}
                  title="View Details"
                >
                  👁️ View
                </button>
                
                <button 
                  className="action-btn secondary"
                  onClick={() => downloadDocument(document.id, document.originalName)}
                  title="Download"
                >
                  📥 Download
                </button>
                
                <button 
                  className="action-btn tertiary"
                  onClick={() => shareDocument(document)}
                  title="Share"
                >
                  🔗 Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="document-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Document Details</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <div className="modal-content">
              <div className="document-detail-header">
                <div className="detail-icon">
                  {getFileTypeIcon(selectedDocument.mimeType)}
                </div>
                <div className="detail-info">
                  <h3>{selectedDocument.originalName}</h3>
                  {getStatusBadge(selectedDocument.verificationStatus || 'pending')}
                </div>
              </div>

              <div className="document-details-grid">
                <div className="detail-section">
                  <h4>File Information</h4>
                  <div className="detail-items">
                    <div className="detail-item">
                      <span className="detail-label">File Size:</span>
                      <span className="detail-value">{formatFileSize(selectedDocument.fileSize)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">File Type:</span>
                      <span className="detail-value">{selectedDocument.mimeType}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Upload Date:</span>
                      <span className="detail-value">
                        {new Date(selectedDocument.uploadDate).toLocaleString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Document Hash:</span>
                      <span className="detail-value hash-value">
                        {selectedDocument.fileHash || 'Not available'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedDocument.extractedText && (
                  <div className="detail-section">
                    <h4>Extracted Text</h4>
                    <div className="extracted-text">
                      {selectedDocument.extractedText}
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Verification History</h4>
                  <div className="verification-timeline">
                    <div className="timeline-item">
                      <div className="timeline-icon">📤</div>
                      <div className="timeline-content">
                        <div className="timeline-title">Document Uploaded</div>
                        <div className="timeline-date">
                          {new Date(selectedDocument.uploadDate).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {selectedDocument.verificationStatus !== 'pending' && (
                      <div className="timeline-item">
                        <div className="timeline-icon">
                          {selectedDocument.verificationStatus === 'verified' ? '✅' : '❌'}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-title">
                            Document {selectedDocument.verificationStatus === 'verified' ? 'Verified' : 'Rejected'}
                          </div>
                          <div className="timeline-date">
                            {new Date(selectedDocument.verificationDate || selectedDocument.uploadDate).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => downloadDocument(selectedDocument.id, selectedDocument.originalName)}
                >
                  📥 Download
                </button>
                
                <button 
                  className="action-btn secondary"
                  onClick={() => shareDocument(selectedDocument)}
                >
                  🔗 Share
                </button>
                
                <button 
                  className="action-btn tertiary"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;