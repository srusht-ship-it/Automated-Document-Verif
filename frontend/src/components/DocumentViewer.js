import React, { useState, useEffect } from 'react';
import '../styles/DocumentViewer.css';

const DocumentViewer = ({ documentId, onClose }) => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [showMetadata, setShowMetadata] = useState(false);

  useEffect(() => {
    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      const token = localStorage.getItem('doc_verify_token');
      const response = await fetch(`http://localhost:5000/api/documents/${documentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocument(data.data.document);
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('doc_verify_token');
      const response = await fetch(`http://localhost:5000/api/documents/${documentId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = document.originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download document');
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/verify/${documentId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard!');
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="document-viewer-overlay">
        <div className="document-viewer">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading document...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="document-viewer-overlay">
        <div className="document-viewer">
          <div className="error-container">
            <h3>Document not found</h3>
            <button onClick={onClose} className="close-btn">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="document-viewer-overlay">
      <div className="document-viewer">
        {/* Header */}
        <div className="viewer-header">
          <div className="document-info">
            <h3>{document.originalName}</h3>
            <div className="document-status">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(document.status) }}
              >
                {document.status.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="viewer-controls">
            <button 
              className="control-btn"
              onClick={() => setZoom(Math.max(50, zoom - 25))}
              disabled={zoom <= 50}
            >
              🔍-
            </button>
            <span className="zoom-level">{zoom}%</span>
            <button 
              className="control-btn"
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              disabled={zoom >= 200}
            >
              🔍+
            </button>
            
            <button 
              className="control-btn"
              onClick={() => setShowMetadata(!showMetadata)}
            >
              ℹ️
            </button>
            
            <button className="control-btn" onClick={handleDownload}>
              📥
            </button>
            
            <button className="control-btn" onClick={handleShare}>
              🔗
            </button>
            
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="viewer-content">
          <div className="document-preview" style={{ transform: `scale(${zoom / 100})` }}>
            {document.metadata?.mimeType?.includes('image') ? (
              <img 
                src={`http://localhost:5000/api/documents/${documentId}/download`}
                alt={document.originalName}
                className="document-image"
              />
            ) : (
              <div className="document-placeholder">
                <div className="file-icon">📄</div>
                <p>{document.originalName}</p>
                <p className="file-type">{document.metadata?.mimeType || 'Unknown type'}</p>
                <button onClick={handleDownload} className="download-btn">
                  Download to View
                </button>
              </div>
            )}
          </div>

          {/* Metadata Panel */}
          {showMetadata && (
            <div className="metadata-panel">
              <h4>Document Details</h4>
              
              <div className="metadata-section">
                <h5>Basic Information</h5>
                <div className="metadata-item">
                  <span className="label">File Name:</span>
                  <span className="value">{document.originalName}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">File Size:</span>
                  <span className="value">
                    {document.metadata?.fileSize ? 
                      `${(document.metadata.fileSize / 1024).toFixed(1)} KB` : 
                      'Unknown'
                    }
                  </span>
                </div>
                <div className="metadata-item">
                  <span className="label">Document Type:</span>
                  <span className="value">{document.metadata?.documentType || 'Unknown'}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Status:</span>
                  <span className="value" style={{ color: getStatusColor(document.status) }}>
                    {document.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="metadata-section">
                <h5>Upload Information</h5>
                <div className="metadata-item">
                  <span className="label">Uploaded:</span>
                  <span className="value">
                    {new Date(document.uploadedAt).toLocaleString()}
                  </span>
                </div>
                <div className="metadata-item">
                  <span className="label">Issuer:</span>
                  <span className="value">{document.issuer?.name || 'Unknown'}</span>
                </div>
                {document.issuer?.organization && (
                  <div className="metadata-item">
                    <span className="label">Organization:</span>
                    <span className="value">{document.issuer.organization}</span>
                  </div>
                )}
              </div>

              {document.metadata?.ocrResult && (
                <div className="metadata-section">
                  <h5>OCR Analysis</h5>
                  <div className="metadata-item">
                    <span className="label">Confidence:</span>
                    <span className="value">{document.metadata.ocrResult.confidence}%</span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Word Count:</span>
                    <span className="value">{document.metadata.ocrResult.wordCount || 0}</span>
                  </div>
                </div>
              )}

              {document.extractedText && (
                <div className="metadata-section">
                  <h5>Extracted Text Preview</h5>
                  <div className="extracted-text">
                    {document.extractedText.substring(0, 300)}
                    {document.extractedText.length > 300 && '...'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;