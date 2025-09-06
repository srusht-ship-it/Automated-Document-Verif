import React from 'react';
import DocumentUpload from '../components/DocumentUpload';

const UploadPage = () => {
  const handleUploadSuccess = (uploadedDocuments) => {
    console.log('Documents uploaded successfully:', uploadedDocuments);
    alert(`Successfully uploaded ${uploadedDocuments.length} document(s)!`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <DocumentUpload onUploadSuccess={handleUploadSuccess} />
    </div>
  );
};

export default UploadPage;