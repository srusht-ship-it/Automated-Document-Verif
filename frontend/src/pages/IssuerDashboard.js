import React, { useState, useEffect } from 'react';
import SidebarNavigation from '../components/SidebarNavigation';
import HeaderBar from '../components/HeaderBar';
import StatsCards from '../components/StatsCards';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
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

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = (uploadedDocuments) => {
    console.log('Documents uploaded successfully:', uploadedDocuments);
    // Trigger refresh of document list
    setRefreshTrigger(prev => prev + 1);
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
      case 'issued':
        return (
          <div className="tab-content">
            <h2 className="section-title">Issued Documents</h2>
            <DocumentList refreshTrigger={refreshTrigger} />
          </div>
        );
      case 'templates':
        return <DocumentTemplates />;
      case 'bulk':
        return <BulkUploadInterface />;
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
      </div>
    </div>
  );
};

// Document Templates Component
const DocumentTemplates = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Degree Certificate',
      type: 'Educational',
      fields: ['Student Name', 'Degree', 'Institution', 'Date', 'Grade'],
      usage: 45,
      lastUsed: '2024-01-18'
    },
    {
      id: 2,
      name: 'Transcript',
      type: 'Educational',
      fields: ['Student Name', 'Courses', 'Grades', 'Credits', 'GPA'],
      usage: 32,
      lastUsed: '2024-01-19'
    },
    {
      id: 3,
      name: 'Employment Certificate',
      type: 'Professional',
      fields: ['Employee Name', 'Position', 'Department', 'Duration', 'Salary'],
      usage: 28,
      lastUsed: '2024-01-20'
    }
  ]);

  const [showCreateTemplate, setShowCreateTemplate] = useState(false);

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

      <div className="templates-grid">
        {templates.map(template => (
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
                <span className="stat-value">{template.usage}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Last Used:</span>
                <span className="stat-value">{new Date(template.lastUsed).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="template-actions">
              <button className="action-btn primary">📝 Edit</button>
              <button className="action-btn secondary">📄 Use</button>
              <button className="action-btn tertiary">🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showCreateTemplate && (
        <div className="modal-overlay" onClick={() => setShowCreateTemplate(false)}>
          <div className="create-template-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Template</h2>
              <button className="close-btn" onClick={() => setShowCreateTemplate(false)}>×</button>
            </div>
            <div className="modal-content">
              <p>Template creation form would go here...</p>
            </div>
          </div>
        </div>
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
  return (
    <div className="bulk-upload">
      <div className="card">
        <h3>Bulk Document Upload</h3>
        <p>Upload multiple documents at once using CSV template</p>
        <div className="bulk-actions">
          <button className="btn btn-secondary">📥 Download Template</button>
          <button className="btn btn-primary">📤 Upload CSV</button>
        </div>
      </div>
    </div>
  );
};

export default IssuerDashboard;