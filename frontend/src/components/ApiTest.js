import React, { useState } from 'react';

const ApiTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name, url, needsAuth = false) => {
    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      
      if (needsAuth) {
        const token = localStorage.getItem('doc_verify_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(url, { headers });
      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          success: response.ok,
          data: data
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'ERROR',
          success: false,
          error: error.message
        }
      }));
    }
    setLoading(false);
  };

  const checkAuth = () => {
    const token = localStorage.getItem('doc_verify_token');
    const user = localStorage.getItem('doc_verify_user');
    
    setResults(prev => ({
      ...prev,
      auth: {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        hasUser: !!user,
        user: user ? JSON.parse(user) : null
      }
    }));
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', margin: '20px', borderRadius: '8px' }}>
      <h3>API Testing Panel</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={checkAuth} style={{ margin: '5px', padding: '8px 16px' }}>
          Check Auth Status
        </button>
        <button 
          onClick={() => testEndpoint('health', 'http://localhost:5000/api/health')}
          style={{ margin: '5px', padding: '8px 16px' }}
        >
          Test Health
        </button>
        <button 
          onClick={() => testEndpoint('types', 'http://localhost:5000/api/documents/types')}
          style={{ margin: '5px', padding: '8px 16px' }}
        >
          Test Document Types
        </button>
        <button 
          onClick={() => testEndpoint('stats', 'http://localhost:5000/api/documents/stats', true)}
          style={{ margin: '5px', padding: '8px 16px' }}
        >
          Test Stats (Auth)
        </button>
        <button 
          onClick={() => testEndpoint('documents', 'http://localhost:5000/api/documents', true)}
          style={{ margin: '5px', padding: '8px 16px' }}
        >
          Test Documents (Auth)
        </button>
      </div>

      {loading && <p>Testing...</p>}

      <div style={{ background: 'white', padding: '15px', borderRadius: '4px' }}>
        <h4>Results:</h4>
        <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '400px' }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ApiTest;