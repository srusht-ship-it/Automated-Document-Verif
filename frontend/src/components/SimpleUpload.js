import React, { useState } from 'react';

const SimpleUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult('');
  };

  const handleUpload = async () => {
    if (!file) {
      setResult('Please select a file');
      return;
    }

    setUploading(true);
    setResult('Uploading...');

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', 'other');

      const token = localStorage.getItem('doc_verify_token');

      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setResult('✅ Upload successful!');
        setFile(null);
      } else {
        setResult(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>Upload Document</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {result && (
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          {result}
        </div>
      )}
    </div>
  );
};

export default SimpleUpload;