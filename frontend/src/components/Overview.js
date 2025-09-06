import React, { useState } from 'react';

const UploadDocuments = () => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage('Uploading...');

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', 'other');

      const token = localStorage.getItem('doc_verify_token');

      if (!token) {
        setMessage('❌ No authentication token found. Please login again.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        setMessage(`❌ Upload failed: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Upload successful! OCR processing completed.');
      } else {
        setMessage(`❌ Upload failed: ${data.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Upload Documents</h2>
      <div style={{ border: '2px dashed #ccc', padding: '40px', textAlign: 'center', borderRadius: '8px', background: '#f9f9f9' }}>
        <input 
          type="file" 
          accept=".jpg,.jpeg,.png,.pdf" 
          onChange={handleFileUpload}
          disabled={uploading}
          style={{ marginBottom: '20px' }}
        />
        <p>Select JPG, PNG, or PDF files to upload</p>
        <p>Files will be processed with OCR automatically</p>
      </div>
      {message && (
        <div style={{ marginTop: '20px', padding: '15px', background: message.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`, borderRadius: '4px' }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default UploadDocuments;
