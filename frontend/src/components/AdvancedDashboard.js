import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const AdvancedDashboard = ({ userRole }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('doc_verify_token');
      const response = await fetch(`/api/analytics/dashboard?period=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type) => {
    try {
      const token = localStorage.getItem('doc_verify_token');
      const response = await fetch(`/api/analytics/export/${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading analytics...</div>;
  }

  return (
    <div className="advanced-dashboard">
      <div className="dashboard-header">
        <h2>Advanced Analytics Dashboard</h2>
        <div className="dashboard-controls">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-selector"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          
          <div className="export-buttons">
            <button onClick={() => exportReport('usage')} className="export-btn">
              📊 Export Usage
            </button>
            <button onClick={() => exportReport('fraud')} className="export-btn">
              🔍 Export Fraud
            </button>
          </div>
        </div>
      </div>

      {analytics && (
        <>
          {/* Overview Cards */}
          <div className="metrics-grid">
            <MetricCard 
              title="Total Documents" 
              value={analytics.overview.total}
              trend={analytics.trends.growth}
              icon="📄"
            />
            <MetricCard 
              title="Verification Rate" 
              value={`${analytics.overview.verificationRate}%`}
              trend={analytics.trends.trend}
              icon="✅"
            />
            <MetricCard 
              title="Success Rate" 
              value={`${analytics.overview.successRate}%`}
              trend="stable"
              icon="🎯"
            />
            <MetricCard 
              title="Fraud Detection" 
              value={`${analytics.fraudDetection.fraudDetectionRate}%`}
              trend="down"
              icon="🛡️"
            />
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <div className="chart-container">
              <h3>Document Activity</h3>
              <SimpleLineChart data={analytics.charts.daily} />
            </div>
            
            <div className="chart-container">
              <h3>Status Distribution</h3>
              <SimplePieChart data={analytics.charts.statusDistribution} />
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="performance-section">
            <h3>System Performance</h3>
            <div className="performance-grid">
              <div className="performance-card">
                <span className="metric-label">Avg Response Time</span>
                <span className="metric-value">{analytics.performance.avgResponseTime}ms</span>
              </div>
              <div className="performance-card">
                <span className="metric-label">Error Rate</span>
                <span className="metric-value">{analytics.performance.errorRate}%</span>
              </div>
              <div className="performance-card">
                <span className="metric-label">Uptime</span>
                <span className="metric-value">{Math.floor(analytics.performance.uptime / 3600)}h</span>
              </div>
            </div>
          </div>

          {/* Fraud Analysis */}
          <div className="fraud-section">
            <h3>Fraud Detection Analysis</h3>
            <div className="fraud-stats">
              <div className="fraud-stat">
                <span>Documents Analyzed: {analytics.fraudDetection.totalAnalyzed}</span>
              </div>
              <div className="fraud-stat">
                <span>Avg Fraud Score: {analytics.fraudDetection.avgFraudScore}</span>
              </div>
              <div className="fraud-stat">
                <span>High Risk: {analytics.fraudDetection.highRiskDocuments}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const MetricCard = ({ title, value, trend, icon }) => (
  <div className="metric-card">
    <div className="metric-icon">{icon}</div>
    <div className="metric-content">
      <h4>{title}</h4>
      <div className="metric-value">{value}</div>
      <div className={`metric-trend ${trend}`}>
        {trend === 'up' && '↗️ +'}
        {trend === 'down' && '↘️ -'}
        {trend === 'stable' && '→ '}
        {typeof trend === 'number' && `${trend}%`}
      </div>
    </div>
  </div>
);

const SimpleLineChart = ({ data }) => (
  <div className="simple-chart">
    <div className="chart-bars">
      {data?.slice(-7).map((item, index) => (
        <div key={index} className="chart-bar">
          <div 
            className="bar uploads" 
            style={{ height: `${(item.uploads / Math.max(...data.map(d => d.uploads))) * 100}%` }}
            title={`${item.date}: ${item.uploads} uploads`}
          />
          <span className="bar-label">{new Date(item.date).getDate()}</span>
        </div>
      ))}
    </div>
  </div>
);

const SimplePieChart = ({ data }) => {
  const total = Object.values(data || {}).reduce((a, b) => a + b, 0);
  
  return (
    <div className="pie-chart">
      {Object.entries(data || {}).map(([status, count]) => (
        <div key={status} className="pie-segment">
          <div className={`pie-color ${status}`}></div>
          <span>{status}: {count} ({total > 0 ? Math.round(count/total*100) : 0}%)</span>
        </div>
      ))}
    </div>
  );
};

export default AdvancedDashboard;