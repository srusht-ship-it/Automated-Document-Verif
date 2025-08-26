// frontend/src/components/DocumentUpload.js
import React, { useState, useRef } from 'react';
import '../styles/DocumentUpload.css';

const DocumentUpload = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadResults, setUploadResults] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const supportedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const validateFile = (file) => {
    if (!supportedTypes.includes(file.type)) {
      return 'Unsupported file type. Please upload JPEG, PNG, or PDF files.';
    }
    if (file.size > maxFileSize) {
      return 'File size exceeds 50MB limit.';
    }
    return null;
  };

  const handleFiles = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = [];
    let hasErrors = false;

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        setError(error);
        hasErrors = true;
      } else {
        validFiles.push({
          file,
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
          status: 'pending'
        });
      }
    });

    if (!hasErrors) {
      setError('');
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== fileId);
      // Clean up preview URLs
      const removedFile = prev.find(f => f.id === fileId);
      if (removedFile && removedFile.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return updatedFiles;
    });

    // Remove from progress tracking
    setUploadProgress(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      setError('Please select files to upload.');
      return;
    }

    setUploading(true);
    setError('');
    const results = [];

    for (const fileData of files) {
      try {
        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [fileData.id]: { progress: 0, status: 'uploading' }
        }));

        const formData = new FormData();
        formData.append('document', fileData.file);

        // Get auth token
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5000/api/documents/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          
          setUploadProgress(prev => ({
            ...prev,
            [fileData.id]: { progress: 100, status: 'completed' }
          }));

          results.push({
            ...fileData,
            status: 'completed',
            documentId: result.document.id,
            uploadDate: new Date().toISOString()
          });

          // Update file status
          setFiles(prev => prev.map(f => 
            f.id === fileData.id ? { ...f, status: 'completed' } : f
          ));

        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }

      } catch (error) {
        console.error('Upload error:', error);
        
        setUploadProgress(prev => ({
          ...prev,
          [fileData.id]: { progress: 0, status: 'error' }
        }));

        results.push({
          ...fileData,
          status: 'error',
          error: error.message
        });

        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'error', error: error.message } : f
        ));
      }
    }

    setUploadResults(results);
    setUploading(false);

    // Call success callback if provided
    if (onUploadSuccess && results.some(r => r.status === 'completed')) {
      onUploadSuccess(results.filter(r => r.status === 'completed'));
    }
  };

  const clearAll = () => {
    // Clean up preview URLs
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    
    setFiles([]);
    setUploadProgress({});
    setUploadResults([]);
    setError('');
  };

  return (
    <div className="document-upload">
      <div className="upload-header">
        <h2>Upload Documents</h2>
        <p>Upload your documents for verification and secure storage</p>
      </div>

      <div 
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        
        <div className="upload-icon">
          {dragActive ? '📁' : '📎'}
        </div>
        
        <div className="upload-text">
          <h3>{dragActive ? 'Drop files here' : 'Choose files or drag here'}</h3>
          <p>Supports: JPEG, PNG, PDF (Max 50MB each)</p>
        </div>
        
        <button className="upload-button">
          Browse Files
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="file-list-section">
          <div className="file-list-header">
            <h3>Selected Files ({files.length})</h3>
            <div className="file-actions">
              <button 
                className="upload-all-btn"
                onClick={uploadFiles}
                disabled={uploading}
              >
                {uploading ? '⏳ Uploading...' : '📤 Upload All'}
              </button>
              <button 
                className="clear-all-btn"
                onClick={clearAll}
                disabled={uploading}
              >
                🗑️ Clear All
              </button>
            </div>
          </div>

          <div className="file-list">
            {files.map((fileData) => {
              const progress = uploadProgress[fileData.id];
              return (
                <div key={fileData.id} className={`file-item ${fileData.status}`}>
                  <div className="file-preview">
                    {fileData.preview ? (
                      <img src={fileData.preview} alt="Preview" />
                    ) : (
                      <div className="file-type-icon">
                        {fileData.type === 'application/pdf' ? '📄' : '📎'}
                      </div>
                    )}
                  </div>

                  <div className="file-info">
                    <div className="file-name">{fileData.name}</div>
                    <div className="file-size">{formatFileSize(fileData.size)}</div>
                    
                    {progress && (
                      <div className="upload-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${progress.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">
                          {progress.status === 'uploading' ? `${progress.progress}%` : 
                           progress.status === 'completed' ? '✅ Completed' : 
                           progress.status === 'error' ? '❌ Failed' : ''}
                        </span>
                      </div>
                    )}

                    {fileData.error && (
                      <div className="file-error">❌ {fileData.error}</div>
                    )}
                  </div>

                  <div className="file-actions">
                    <button
                      className="remove-file-btn"
                      onClick={() => removeFile(fileData.id)}
                      disabled={uploading}
                    >
                      ❌
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {uploadResults.length > 0 && (
        <div className="upload-results">
          <h3>Upload Results</h3>
          <div className="results-summary">
            <span className="success-count">
              ✅ {uploadResults.filter(r => r.status === 'completed').length} Successful
            </span>
            <span className="error-count">
              ❌ {uploadResults.filter(r => r.status === 'error').length} Failed
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;