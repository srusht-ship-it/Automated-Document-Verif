import React, { useState } from 'react';

const TestUpload = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testUpload = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      // Create a simple test file
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      const formData = new FormData();
      formData.append('document', testFile);
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
      setResult(JSON.stringify(data, null, 2));
      
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Upload Test</h3>
      <button onClick={testUpload} disabled={loading}>
        {loading ? 'Testing...' : 'Test Upload'}
      </button>
      <pre style={{ background: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
        {result}
      </pre>
    </div>
  );
};

export default TestUpload;