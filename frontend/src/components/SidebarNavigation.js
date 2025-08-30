import React, { useState, useEffect } from 'react';
import '../styles/SidebarNavigation.css';

const SidebarNavigation = ({ activeTab, onTabChange, userRole }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('doc_verify_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const getMenuItems = () => {
    const baseItems = [
      { id: 'overview', icon: '📊', label: 'Overview', roles: ['individual', 'issuer', 'verifier'] }
    ];

    const roleSpecificItems = {
      individual: [
        { id: 'upload', icon: '📎', label: 'Upload Documents' },
        { id: 'documents', icon: '📄', label: 'My Documents' },
        { id: 'verification', icon: '🔍', label: 'Verification History' },
        { id: 'share', icon: '🔗', label: 'Share Documents' }
      ],
      issuer: [
        { id: 'issue', icon: '📋', label: 'Issue Documents' },
        { id: 'templates', icon: '📝', label: 'Templates' },
        { id: 'bulk', icon: '📦', label: 'Bulk Operations' },
        { id: 'issued', icon: '📄', label: 'Issued Documents' }
      ],
      verifier: [
        { id: 'queue', icon: '📋', label: 'Verification Queue' },
        { id: 'verify', icon: '🔍', label: 'Quick Verify' },
        { id: 'reports', icon: '📊', label: 'Reports' },
        { id: 'audit', icon: '🔒', label: 'Audit Trail' }
      ]
    };

    const profileItems = [
      { id: 'profile', icon: '👤', label: 'Profile', roles: ['individual', 'issuer', 'verifier'] }
    ];

    return [
      ...baseItems,
      ...(roleSpecificItems[userRole] || []),
      ...profileItems
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          {!collapsed && <span>DocVerify</span>}
          <button 
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      <div className="sidebar-user">
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
            </div>
            {!collapsed && (
              <div className="user-details">
                <div className="user-name">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.email
                  }
                </div>
                <div className="user-role">{user.role}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button 
          className="nav-item logout-btn"
          onClick={() => {
            if (confirm('Are you sure you want to logout?')) {
              localStorage.removeItem('doc_verify_token');
              localStorage.removeItem('doc_verify_user');
              window.location.href = '/';
            }
          }}
          title={collapsed ? 'Logout' : ''}
        >
          <span className="nav-icon">🚪</span>
          {!collapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default SidebarNavigation;