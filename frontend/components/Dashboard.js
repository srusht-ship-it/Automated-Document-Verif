// frontend/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    pendingVerifications: 0,
    completedVerifications: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage (set during login)
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    loadDashboardData(parsedUser);
  }, [navigate]);

  const loadDashboardData = async (userData) => {
    try {
      // Mock data for now - will be replaced with actual API calls
      const mockStats = {
        issuer: {
          totalDocuments: 156,
          pendingVerifications: 12,
          completedVerifications: 89,
          recentActivity: [
            { type: 'issued', document: 'Degree Certificate', recipient: 'John Doe', date: '2024-01-20' },
            { type: 'issued', document: 'Transcript', recipient: 'Jane Smith', date: '2024-01-19' },
            { type: 'verified', document: 'ID Proof', verifier: 'Bank XYZ', date: '2024-01-18' }
          ]
        },
        individual: {
          totalDocuments: 8,
          pendingVerifications: 2,
          completedVerifications: 15,
          recentActivity: [
            { type: 'uploaded', document: 'Passport', date: '2024-01-20' },
            { type: 'verified', document: 'Degree Certificate', verifier: 'ABC Corp', date: '2024-01-19' },
            { type: 'shared', document: 'Resume', recipient: 'HR Department', date: '2024-01-18' }
          ]
        },
        verifier: {
          totalDocuments: 0,
          pendingVerifications: 25,
          completedVerifications: 234,
          recentActivity: [
            { type: 'verified', document: 'Employment Certificate', applicant: 'John Doe', date: '2024-01-20' },
            { type: 'verified', document: 'Educational Transcript', applicant: 'Jane Smith', date: '2024-01-19' },
            { type: 'requested', document: 'Identity Proof', applicant: 'Mike Johnson', date: '2024-01-18' }
          ]
        }
      };

      setStats(mockStats[userData.role] || mockStats.individual);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleName = (role) => {
    const roleNames = {
      'issuer': 'Issuing Authority',
      'individual': 'Individual User',
      'verifier': 'Verifying Authority'
    };
    return roleNames[role] || 'User';
  };

  const getQuickActions = () => {
    const actions = {
      issuer: [
        { title: 'Issue New Certificate', icon: '📜', path: '/documents/upload', color: 'primary' },
        { title: 'View Issued Documents', icon: '📋', path: '/documents', color: 'secondary' },
        { title: 'Batch Upload', icon: '📤', path: '/documents/batch', color: 'tertiary' },
        { title: 'Templates', icon: '🎨', path: '/templates', color: 'quaternary' }
      ],
      individual: [
        { title: 'Upload Document', icon: '📎', path: '/documents/upload', color: 'primary' },
        { title: 'My Documents', icon: '📄', path: '/documents', color: 'secondary' },
        { title: 'Verification History', icon: '🔍', path: '/verifications', color: 'tertiary' },
        { title: 'Share Documents', icon: '🔗', path: '/share', color: 'quaternary' }
      ],
      verifier: [
        { title: 'Verify Document', icon: '✅', path: '/verify', color: 'primary' },
        { title: 'Verification Queue', icon: '⏳', path: '/queue', color: 'secondary' },
        { title: 'Verification History', icon: '📊', path: '/history', color: 'tertiary' },
        { title: 'Reports', icon: '📈', path: '/reports', color: 'quaternary' }
      ]
    };
    return actions[user?.role] || actions.individual;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>{getGreeting()}, {user?.name}!</h1>
          <p className="role-badge">{getRoleName(user?.role)}</p>
        </div>
        <div className="header-actions">
          <button className="notification-btn">
            <span className="notification-icon">🔔</span>
            <span className="notification-count">3</span>
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card primary">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>{stats.totalDocuments}</h3>
            <p>{user?.role === 'verifier' ? 'Documents Processed' : 'Total Documents'}</p>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingVerifications}</h3>
            <p>Pending Verifications</p>
          </div>
        </div>

        <div className="stat-card tertiary">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedVerifications}</h3>
            <p>Completed Verifications</p>
          </div>
        </div>

        <div className="stat-card quaternary">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{Math.round((stats.completedVerifications / (stats.completedVerifications + stats.pendingVerifications)) * 100) || 0}%</h3>
            <p>Success Rate</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            {getQuickActions().map((action, index) => (
              <button
                key={index}
                className={`quick-action-card ${action.color}`}
                onClick={() => navigate(action.path)}
              >
                <div className="action-icon">{action.icon}</div>
                <span className="action-title">{action.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="recent-activity-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'issued' && '📜'}
                    {activity.type === 'verified' && '✅'}
                    {activity.type === 'uploaded' && '📎'}
                    {activity.type === 'shared' && '🔗'}
                    {activity.type === 'requested' && '📋'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">
                      {activity.type === 'issued' && `Issued ${activity.document} to ${activity.recipient}`}
                      {activity.type === 'verified' && `Verified ${activity.document} ${activity.verifier ? `by ${activity.verifier}` : activity.applicant ? `for ${activity.applicant}` : ''}`}
                      {activity.type === 'uploaded' && `Uploaded ${activity.document}`}
                      {activity.type === 'shared' && `Shared ${activity.document} with ${activity.recipient}`}
                      {activity.type === 'requested' && `Verification requested for ${activity.document} by ${activity.applicant}`}
                    </div>
                    <div className="activity-date">{new Date(activity.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activity">
                <div className="no-activity-icon">📝</div>
                <p>No recent activity</p>
                <span>Start by uploading or verifying documents</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;