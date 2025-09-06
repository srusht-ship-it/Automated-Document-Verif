import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const userData = localStorage.getItem('doc_verify_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        email: parsedUser.email || '',
        organization: parsedUser.organization || ''
      });
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('doc_verify_token');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
        localStorage.setItem('doc_verify_user', JSON.stringify(data.data.user));
        setEditing(false);
        alert('Profile updated successfully');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile');
    }
  };

  const sendOTP = async () => {
    try {
      const token = localStorage.getItem('doc_verify_token');
      const response = await fetch('/api/2fa/send-otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: user.email })
      });

      if (response.ok) {
        setOtpSent(true);
        alert('OTP sent to your email');
      }
    } catch (error) {
      console.error('OTP send error:', error);
      alert('Failed to send OTP');
    }
  };

  const verifyOTP = async () => {
    try {
      const token = localStorage.getItem('doc_verify_token');
      const response = await fetch('/api/2fa/verify-otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: user.email, otp: otp })
      });

      if (response.ok) {
        setTwoFactorEnabled(true);
        setOtpSent(false);
        setOtp('');
        alert('2FA enabled successfully');
      } else {
        alert('Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verify error:', error);
      alert('Failed to verify OTP');
    }
  };

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>User Profile</h2>
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>

      <div className="profile-content">
        {/* Basic Information */}
        <div className="profile-section">
          <h3>Basic Information</h3>
          <div className="profile-form">
            <div className="form-group">
              <label>First Name:</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              ) : (
                <span>{user.firstName || 'Not set'}</span>
              )}
            </div>

            <div className="form-group">
              <label>Last Name:</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              ) : (
                <span>{user.lastName || 'Not set'}</span>
              )}
            </div>

            <div className="form-group">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>

            <div className="form-group">
              <label>Role:</label>
              <span className={`role-badge ${user.role}`}>{user.role}</span>
            </div>

            <div className="form-group">
              <label>Organization:</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({...formData, organization: e.target.value})}
                />
              ) : (
                <span>{user.organization || 'Not set'}</span>
              )}
            </div>

            <div className="form-actions">
              {editing ? (
                <>
                  <button onClick={handleSave} className="btn-primary">Save</button>
                  <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-primary">Edit Profile</button>
              )}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="profile-section">
          <h3>Security Settings</h3>
          <div className="security-settings">
            <div className="security-item">
              <div className="security-info">
                <h4>Two-Factor Authentication</h4>
                <p>Add an extra layer of security to your account</p>
              </div>
              <div className="security-action">
                {twoFactorEnabled ? (
                  <span className="status enabled">✅ Enabled</span>
                ) : (
                  <>
                    {!otpSent ? (
                      <button onClick={sendOTP} className="btn-primary">Enable 2FA</button>
                    ) : (
                      <div className="otp-verification">
                        <input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength="6"
                        />
                        <button onClick={verifyOTP} className="btn-primary">Verify</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="security-item">
              <div className="security-info">
                <h4>Password</h4>
                <p>Change your account password</p>
              </div>
              <div className="security-action">
                <button className="btn-secondary">Change Password</button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="profile-section">
          <h3>Account Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Account Created:</span>
              <span className="stat-value">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Last Login:</span>
              <span className="stat-value">Today</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Role:</span>
              <span className="stat-value">{user.role}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .profile-section {
          background: var(--bg-secondary);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid var(--border-color);
        }

        .profile-form .form-group {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }

        .profile-form label {
          width: 120px;
          font-weight: bold;
          color: var(--text-secondary);
        }

        .profile-form input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .role-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .role-badge.verifier {
          background: #e3f2fd;
          color: #1976d2;
        }

        .role-badge.issuer {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .role-badge.individual {
          background: #e8f5e8;
          color: #388e3c;
        }

        .form-actions {
          margin-top: 20px;
        }

        .btn-primary, .btn-secondary {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 10px;
        }

        .btn-primary {
          background: var(--accent-color);
          color: white;
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .security-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid var(--border-color);
        }

        .security-item:last-child {
          border-bottom: none;
        }

        .status.enabled {
          color: var(--success-color);
          font-weight: bold;
        }

        .otp-verification {
          display: flex;
          gap: 10px;
        }

        .otp-verification input {
          width: 120px;
          padding: 6px 8px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          text-align: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background: var(--bg-primary);
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        .stat-label {
          color: var(--text-secondary);
        }

        .stat-value {
          font-weight: bold;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default Profile;