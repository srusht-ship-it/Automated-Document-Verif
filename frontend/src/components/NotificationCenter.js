import React, { useState, useEffect } from 'react';
import '../styles/NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      // Mock notifications - in real app, fetch from API
      const mockNotifications = [
        {
          id: 1,
          type: 'success',
          title: 'Document Verified',
          message: 'Your birth certificate has been successfully verified',
          timestamp: new Date(Date.now() - 5 * 60000),
          read: false,
          actionUrl: '/documents/123'
        },
        {
          id: 2,
          type: 'info',
          title: 'New Document Uploaded',
          message: 'Academic transcript uploaded and processing started',
          timestamp: new Date(Date.now() - 15 * 60000),
          read: false,
          actionUrl: '/documents/124'
        },
        {
          id: 3,
          type: 'warning',
          title: 'Verification Pending',
          message: 'Your experience certificate is pending verification',
          timestamp: new Date(Date.now() - 30 * 60000),
          read: true,
          actionUrl: '/documents/125'
        },
        {
          id: 4,
          type: 'error',
          title: 'Document Rejected',
          message: 'ID proof was rejected due to poor image quality',
          timestamp: new Date(Date.now() - 60 * 60000),
          read: false,
          actionUrl: '/documents/126'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'read':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notification-center">
      <div className="notification-header">
        <div className="header-left">
          <h2>Notifications</h2>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        
        <div className="header-actions">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="mark-all-btn"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="notification-list">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No notifications</h3>
            <p>
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "No notifications to show."
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id}
              className={`notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="notification-content">
                <div className="notification-title">
                  {notification.title}
                </div>
                <div className="notification-message">
                  {notification.message}
                </div>
                <div className="notification-time">
                  {getTimeAgo(notification.timestamp)}
                </div>
              </div>
              
              <div className="notification-actions">
                {!notification.read && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="action-btn mark-read"
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                
                {notification.actionUrl && (
                  <button 
                    onClick={() => window.location.href = notification.actionUrl}
                    className="action-btn view"
                    title="View details"
                  >
                    👁️
                  </button>
                )}
                
                <button 
                  onClick={() => deleteNotification(notification.id)}
                  className="action-btn delete"
                  title="Delete notification"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;