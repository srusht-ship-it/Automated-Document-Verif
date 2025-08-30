import React, { useState, useEffect } from 'react';
import SidebarNavigation from '../components/SidebarNavigation';
import HeaderBar from '../components/HeaderBar';
import StatsCards from '../components/StatsCards';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import Footer from '../components/Footer';
import '../styles/theme.css';
import '../styles/IssuerDashboard.css';

const IssuerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'issue', label: 'Issue Documents', icon: '📜' },
    { id: 'documents', label: 'Issued Documents', icon: '📋' },
    { id: 'templates', label: 'Templates', icon: '🎨' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ];

  const handleUploadSuccess = (uploadedDocuments) => {
    // Handle successful upload
    console.log('Documents uploaded successfully:', uploadedDocuments);
    // You could show a notification or refresh data here
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <h2 className="section-title">Dashboard Overview</h2>
            <StatsCards userRole="issuer" />
            <IssuerOverview />
          </div>
        );
      case 'issue':
        return (
          <div className="tab-content">
            <h2 className="section-title">Issue Documents</h2>
            <DocumentIssuancePanel onUploadSuccess={handleUploadSuccess} />
          </div>
        );
      case 'documents':
        return (
          <div className="tab-content">
            <h2 className="section-title">Issued Documents</h2>
            <DocumentList />
          </div>
        );
      case 'templates':
        return <DocumentTemplates />;
      case 'bulk':
        return <BulkUploadInterface />;
      case 'analytics':
        return <Analytics />;
      default:
        return (
          <div className="tab-content">
            <h2 className="section-title">Dashboard Overview</h2>
            <StatsCards userRole="issuer" />
          </div>
        );
    }
  };

  const user = JSON.parse(localStorage.getItem('doc_verify_user') || '{}');

  return (
    <div className="app-layout">
      <SidebarNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userRole={user.role || 'issuer'} 
      />
      
      <div className="main-content with-sidebar">
        <HeaderBar 
          title="Issuer Dashboard" 
          subtitle="Issue and manage document certificates" 
        />
        
        <main className="content-area with-header">
          <div className="content-wrapper">
            {renderTabContent()}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

// Document Templates Component
const DocumentTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('doc_verify_token');
      const response = await fetch('http://localhost:5000/api/templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="document-templates">
      <div className="templates-header">
        <h2>Document Templates</h2>
        <p>Create and manage templates for document issuance</p>
        <button 
          className="create-template-btn"
          onClick={() => setShowCreateTemplate(true)}
        >
          ➕ Create Template
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading templates...</div>
      ) : (
        <div className="templates-grid">
          {templates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
              <h3>No templates created yet</h3>
              <p>Create your first template to get started</p>
            </div>
          ) : (
            templates.map(template => (
              <div key={template.id} className="template-card">
                <div className="template-header">
                  <h3>{template.name}</h3>
                  <span className="template-type">{template.type}</span>
                </div>

                <div className="template-fields">
                  <h4>Fields:</h4>
                  <div className="fields-list">
                    {template.fields.map((field, index) => (
                      <span key={index} className="field-tag">{field}</span>
                    ))}
                  </div>
                </div>

                <div className="template-stats">
                  <div className="stat">
                    <span className="stat-label">Usage:</span>
                    <span className="stat-value">{template.usage || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Created:</span>
                    <span className="stat-value">{new Date(template.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="template-actions">
                  <button className="action-btn primary">📝 Edit</button>
                  <button className="action-btn secondary">📄 Use</button>
                  <button className="action-btn tertiary">🗑️ Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showCreateTemplate && (
        <CreateTemplateModal 
          onClose={() => setShowCreateTemplate(false)}
          onSave={(newTemplate) => {
            setTemplates(prev => [...prev, newTemplate]);
            setShowCreateTemplate(false);
          }}
        />
      )}
    </div>
  );
};

// Analytics Component
const Analytics = () => {
  const analyticsData = {
    totalIssued: 156,
    monthlyGrowth: '+12%',
    averageVerificationTime: '24 hours',
    successRate: '98.5%',
    recentActivity: [
      { date: '2024-01-20', issued: 12, verified: 8 },
      { date: '2024-01-19', issued: 15, verified: 12 },
      { date: '2024-01-18', issued: 10, verified: 9 },
      { date: '2024-01-17', issued: 18, verified: 15 },
      { date: '2024-01-16', issued: 8, verified: 7 }
    ]
  };

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Analytics & Reports</h2>
        <p>Track your document issuance performance</p>
      </div>

      <div className="analytics-overview">
        <div className="metric-card">
          <div className="metric-icon">📄</div>
          <div className="metric-content">
            <h3>{analyticsData.totalIssued}</h3>
            <p>Documents Issued</p>
            <span className="metric-trend positive">{analyticsData.monthlyGrowth}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <h3>{analyticsData.averageVerificationTime}</h3>
            <p>Avg. Verification Time</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>{analyticsData.successRate}</h3>
            <p>Success Rate</p>
            <span className="metric-trend positive">+2.1%</span>
          </div>
        </div>
      </div>

      <div className="analytics-chart">
        <h3>Recent Activity</h3>
        <div className="activity-chart">
          {analyticsData.recentActivity.map((day, index) => (
            <div key={index} className="chart-bar">
              <div className="bar issued" style={{ height: `${day.issued * 5}px` }}>
                <span className="bar-value">{day.issued}</span>
              </div>
              <div className="bar verified" style={{ height: `${day.verified * 5}px` }}>
                <span className="bar-value">{day.verified}</span>
              </div>
              <div className="bar-date">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color issued"></div>
            <span>Issued</span>
          </div>
          <div className="legend-item">
            <div className="legend-color verified"></div>
            <span>Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Issuer Overview Component
const IssuerOverview = () => {
  return (
    <div className="issuer-overview">
      <div className="grid-2">
        <div className="card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="btn btn-primary">📜 Issue Certificate</button>
            <button className="btn btn-secondary">📋 Bulk Upload</button>
            <button className="btn btn-secondary">🎨 Create Template</button>
          </div>
        </div>
        
        <div className="card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">📄</span>
              <div className="activity-content">
                <p>Degree certificate issued to John Doe</p>
                <small>2 hours ago</small>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">✅</span>
              <div className="activity-content">
                <p>Transcript verified for Jane Smith</p>
                <small>4 hours ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Document Issuance Panel Component
const DocumentIssuancePanel = ({ onUploadSuccess }) => {
  return (
    <div className="document-issuance">
      <div className="card">
        <DocumentUpload onUploadSuccess={onUploadSuccess} />
      </div>
    </div>
  );
};

// Bulk Upload Interface Component
const BulkUploadInterface = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const downloadTemplate = () => {
    // Create CSV template with headers
    const headers = [
      'Document Name',
      'Document Type', 
      'Recipient Name',
      'Recipient Email',
      'Issue Date',
      'Expiry Date',
      'Additional Info'
    ];
    
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'bulk_upload_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      alert('Please select a CSV file first');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('doc_verify_token');
      const formData = new FormData();
      formData.append('csvFile', selectedFile);

      const response = await fetch('http://localhost:5000/api/bulk/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`Bulk upload completed! ${result.data.successful} documents processed successfully, ${result.data.failed} failed.`);
        setSelectedFile(null);
      } else {
        alert(`Bulk upload failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      alert('Bulk upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="tab-content">
      <h2 className="section-title">Bulk Operations</h2>
      
      <div className="bulk-upload">
        <div className="card">
          <h3>📦 Bulk Document Upload</h3>
          <p>Upload multiple documents at once using our CSV template</p>
          
          <div className="bulk-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Download Template</h4>
                <p>Get the CSV template with required columns</p>
                <button 
                  className="btn btn-secondary"
                  onClick={downloadTemplate}
                >
                  📥 Download Template
                </button>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Fill Template</h4>
                <p>Add your document data to the CSV file</p>
                <div className="template-info">
                  <strong>Required columns:</strong>
                  <ul>
                    <li>Document Name</li>
                    <li>Document Type</li>
                    <li>Recipient Name</li>
                    <li>Recipient Email</li>
                    <li>Issue Date (YYYY-MM-DD)</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Upload CSV</h4>
                <p>Select and upload your completed CSV file</p>
                <div className="file-upload">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    style={{ marginBottom: '10px' }}
                  />
                  {selectedFile && (
                    <div className="selected-file">
                      ✅ Selected: {selectedFile.name}
                    </div>
                  )}
                  <button 
                    className="btn btn-primary"
                    onClick={handleBulkUpload}
                    disabled={!selectedFile || uploading}
                  >
                    {uploading ? '⏳ Uploading...' : '📤 Upload CSV'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3>📊 Bulk Upload History</h3>
          <div className="upload-history">
            <div className="history-item">
              <div className="history-info">
                <strong>January Graduates</strong>
                <div className="history-details">
                  45 documents • Completed • Jan 20, 2024
                </div>
              </div>
              <div className="history-status success">✅ Success</div>
            </div>
            
            <div className="history-item">
              <div className="history-info">
                <strong>Employee Certificates</strong>
                <div className="history-details">
                  23 documents • Completed • Jan 18, 2024
                </div>
              </div>
              <div className="history-status success">✅ Success</div>
            </div>
            
            <div className="history-item">
              <div className="history-info">
                <strong>Training Certificates</strong>
                <div className="history-details">
                  12 documents • Failed • Jan 15, 2024
                </div>
              </div>
              <div className="history-status error">❌ Failed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Template Modal Component
const CreateTemplateModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Educational',
    description: '',
    fields: []
  });
  const [newField, setNewField] = useState('');
  const [errors, setErrors] = useState({});

  const documentTypes = [
    'Educational',
    'Professional', 
    'Government',
    'Medical',
    'Legal',
    'Financial'
  ];

  const predefinedFields = [
    'Full Name', 'Student Name', 'Employee Name',
    'Date of Birth', 'Issue Date', 'Expiry Date',
    'Institution', 'Organization', 'Department',
    'Degree', 'Position', 'Grade', 'GPA',
    'Course', 'Duration', 'Salary', 'ID Number'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const addField = (fieldName) => {
    if (fieldName && !formData.fields.includes(fieldName)) {
      setFormData({
        ...formData,
        fields: [...formData.fields, fieldName]
      });
      setNewField('');
    }
  };

  const removeField = (fieldToRemove) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter(field => field !== fieldToRemove)
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }
    
    if (formData.fields.length === 0) {
      newErrors.fields = 'At least one field is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        console.log('Sending template data:', formData);
        const token = localStorage.getItem('doc_verify_token');
        const response = await fetch('http://localhost:5000/api/templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const result = await response.json();
          onSave(result.data);
        } else {
          const error = await response.json();
          console.error('Template creation error:', error);
          const errorMsg = error.errors ? error.errors.map(e => e.msg).join(', ') : error.message;
          alert(`Failed to create template: ${errorMsg}`);
        }
      } catch (error) {
        console.error('Create template error:', error);
        alert('Failed to create template');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Template</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="form-section">
            <h3>Template Information</h3>
            
            <div className="form-group">
              <label>Template Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Bachelor's Degree Certificate"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label>Document Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of this template..."
                rows="3"
              />
            </div>
          </div>
          
          <div className="form-section">
            <h3>Template Fields *</h3>
            
            <div className="predefined-fields">
              <h4>Quick Add Fields:</h4>
              <div className="field-buttons">
                {predefinedFields.map(field => (
                  <button
                    key={field}
                    type="button"
                    className={`field-btn ${formData.fields.includes(field) ? 'selected' : ''}`}
                    onClick={() => addField(field)}
                    disabled={formData.fields.includes(field)}
                  >
                    {field}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="custom-field">
              <h4>Add Custom Field:</h4>
              <div className="custom-field-input">
                <input
                  type="text"
                  value={newField}
                  onChange={(e) => setNewField(e.target.value)}
                  placeholder="Enter custom field name"
                  onKeyPress={(e) => e.key === 'Enter' && addField(newField)}
                />
                <button
                  type="button"
                  onClick={() => addField(newField)}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="selected-fields">
              <h4>Selected Fields ({formData.fields.length}):</h4>
              {formData.fields.length === 0 ? (
                <p className="no-fields">No fields selected yet</p>
              ) : (
                <div className="fields-list">
                  {formData.fields.map((field, index) => (
                    <div key={index} className="selected-field">
                      <span>{field}</span>
                      <button
                        type="button"
                        onClick={() => removeField(field)}
                        className="remove-field"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.fields && <span className="error-text">{errors.fields}</span>}
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Create Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssuerDashboard;