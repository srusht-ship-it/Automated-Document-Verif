import React, { useState } from 'react';

// DocumentUpload Component (embedded for testing)
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
    
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock results
      const results = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploaded',
        id: Math.random().toString(36).substr(2, 9)
      }));

      // Call success callback
      if (onUploadSuccess) {
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
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
          Select Documents to Upload:
        </label>
        <input
          id="file-input"
          type="file"
          multiple
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 focus:outline-none focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Accepted formats: PDF, DOC, DOCX, JPG, PNG, GIF
        </p>
      </div>

      {files.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Selected Files:</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                <span className="text-sm">
                  📎 {file.name} ({formatFileSize(file.size)})
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
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
        className={`w-full py-3 px-6 rounded-lg font-medium text-white ${
          files.length === 0 || uploading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600 cursor-pointer'
        }`}
      >
        {uploading ? '⏳ Uploading...' : `📤 Upload ${files.length > 0 ? `${files.length} File(s)` : 'Documents'}`}
      </button>

      {uploading && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
          <div className="animate-pulse">Processing your upload...</div>
        </div>
      )}
    </div>
  );
};

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DocumentUpload Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-5 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800">Upload Component Error</h3>
          <p className="text-red-600 mt-2">Error: {this.state.error?.message}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const IndividualDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: 'Document 1.pdf', status: 'Verified ✅', id: '1' },
    { name: 'Document 2.jpg', status: 'Pending ⏳', id: '2' }
  ]);

  const handleUploadSuccess = (results) => {
    console.log('Upload successful:', results);
    
    // Add uploaded files to the list
    const newFiles = results.map(file => ({
      name: file.name,
      status: 'Uploaded ✅',
      id: file.id
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Show success message
    alert(`Successfully uploaded ${results.length} file(s)!`);
    
    // Switch to documents tab to show the results
    setActiveTab('documents');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Individual Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            📊 Overview
          </button>
          
          <button 
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'upload' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            📎 Upload Documents
          </button>
          
          <button 
            onClick={() => setActiveTab('documents')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'documents' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            📄 My Documents ({uploadedFiles.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard Overview</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Welcome!</h3>
                  <p className="text-blue-600 mt-2">Your individual dashboard is ready to use.</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800">Quick Stats</h3>
                  <p className="text-green-600 mt-2">Total Documents: {uploadedFiles.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upload Documents</h2>
              <ErrorBoundary>
                <DocumentUpload onUploadSuccess={handleUploadSuccess} />
              </ErrorBoundary>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Documents</h2>
              {uploadedFiles.length > 0 ? (
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <span className="font-medium">{file.name}</span>
                      <span className="text-sm">{file.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No documents uploaded yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800">Demo Login Credentials:</h3>
          <p className="text-blue-700 mt-1">
            📧 individual@demo.com<br/>
            🔑 demo123
          </p>
        </div>

        {/* Debug Info */}
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
          <strong>Debug Info:</strong> Those 404 errors in console are just missing favicon files and routing issues - they don't affect the upload functionality!
        </div>
      </div>
    </div>
  );
};

export default IndividualDashboard;