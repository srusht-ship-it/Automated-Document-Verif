import React, { useState } from 'react';
import '../styles/DocumentUpload.css';

const DocumentUpload = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setUploading(true);
    const results = [];
    
    try {
      const token = localStorage.getItem('doc_verify_token');
      if (!token) {
        alert('Please login first');
        return;
      }

      // Upload each file
      for (const file of files) {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('documentType', 'other');
        formData.append('description', `Uploaded via dashboard: ${file.name}`);
        
        // Get current user email for recipient
        const userData = localStorage.getItem('doc_verify_user');
        const user = userData ? JSON.parse(userData) : null;
        const recipientEmail = user?.email || 'user@example.com';
        formData.append('recipientEmail', recipientEmail);

        const response = await fetch('http://localhost:5000/api/documents/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          results.push({
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'uploaded',
            id: data.data.document.id,
            documentType: data.data.document.documentType
          });
        } else {
          const errorData = await response.json();
          console.error('Upload failed:', errorData);
          alert(`Failed to upload ${file.name}: ${errorData.message}`);
        }
      }

      // Call success callback if any files were uploaded
      if (results.length > 0 && onUploadSuccess) {
        onUploadSuccess(results);
      }

      // Clear files
      setFiles([]);
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ maxWidth: '500px' }}>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="file-input" style={{ 
          display: 'block', 
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          Select Documents to Upload:
        </label>
        <input
          id="file-input"
          type="file"
          multiple
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          style={{
            padding: '10px',
            border: '2px dashed #ccc',
            borderRadius: '4px',
            width: '100%',
            cursor: 'pointer'
          }}
        />
        <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
          Accepted formats: PDF, DOC, DOCX, JPG, PNG, GIF
        </small>
      </div>

      {files.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Selected Files:</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {files.map((file, index) => (
              <li key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                margin: '5px 0',
                background: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <span>
                  📎 {file.name} ({formatFileSize(file.size)})
                </span>
                <button
                  onClick={() => removeFile(index)}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={files.length === 0 || uploading}
        style={{
          background: files.length === 0 || uploading ? '#6c757d' : '#28a745',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '4px',
          cursor: files.length === 0 || uploading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          width: '100%'
        }}
      >
        {uploading ? '⏳ Uploading...' : `📤 Upload ${files.length > 0 ? `${files.length} File(s)` : 'Documents'}`}
      </button>

      {uploading && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          background: '#fff3cd',
          border: '1px solid #ffeeba',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          Processing your upload...
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;