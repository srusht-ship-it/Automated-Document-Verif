import React, { useState, useEffect } from 'react';
import '../styles/HeaderBar.css';

const HeaderBar = ({ title, subtitle }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('doc_verify_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Mock notifications
    setNotifications([
      { id: 1, message: 'Document verification completed', time: '2 min ago', type: 'success' },
      { id: 2, message: 'New document uploaded', time: '5 min ago', type: 'info' },
      { id: 3, message: 'Verification pending', time: '10 min ago', type: 'warning' }
    ]);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality
    }
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <header className="header-bar">
      <div className="header-left">
        <div className="header-title">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <div className="header-center">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search documents, users, or verification IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              🔍
            </button>
          </div>
        </form>
      </div>

      <div className="header-right">
        <div className="header-actions">
          {/* Notifications */}
          <div className="notification-container">
            <button 
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowNotifications(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">No new notifications</div>
                  ) : (
                    notifications.map(notification => (
                      <div key={notification.id} className={`notification-item ${notification.type}`}>
                        <div className="notification-content">
                          <p>{notification.message}</p>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                        <button 
                          className="mark-read-btn"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          ✓
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="system-status">
            <div className="status-indicator online" title="System Online">
              ●
            </div>
          </div>

          {/* User Profile */}
          {user && (
            <div className="user-profile">
              <div className="user-avatar">
                {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.email
                  }
                </span>
                <span className="user-role">{user.role}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;