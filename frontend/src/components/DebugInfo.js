import React from 'react';

const DebugInfo = () => {
  const token = localStorage.getItem('doc_verify_token');
  const user = localStorage.getItem('doc_verify_user');
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <h4>Debug Info</h4>
      <p><strong>Token:</strong> {token ? 'Present' : 'Missing'}</p>
      <p><strong>User:</strong> {user ? JSON.parse(user).email : 'Not logged in'}</p>
      <p><strong>Role:</strong> {user ? JSON.parse(user).role : 'N/A'}</p>
    </div>
  );
};

export default DebugInfo;