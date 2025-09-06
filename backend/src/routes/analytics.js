import express from 'express';
import analyticsService from '../services/analyticsService.js';
import auditService from '../services/auditService.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/analytics/dashboard
 * Get dashboard analytics
 */
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const analytics = await analyticsService.getDashboardAnalytics(
      req.user.id, 
      req.user.role
    );
    
    auditService.logAction('ANALYTICS_VIEWED', req.user.id, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load analytics',
      error: error.message
    });
  }
});

/**
 * POST /api/analytics/report
 * Generate custom report
 */
router.post('/report', authenticateToken, async (req, res) => {
  try {
    const { type, filters } = req.body;
    const report = await analyticsService.generateReport(type, filters);
    
    auditService.logAction('REPORT_GENERATED', req.user.id, {
      reportType: type,
      filters: filters,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
});

/**
 * GET /api/analytics/audit
 * Get audit logs (admin only)
 */
router.get('/audit', authenticateToken, requireRole('verifier'), async (req, res) => {
  try {
    const { userId, action, startDate, endDate, limit } = req.query;
    
    const logs = await auditService.getAuditLogs({
      userId: userId,
      action: action,
      startDate: startDate,
      endDate: endDate,
      limit: parseInt(limit) || 100
    });

    auditService.logAction('AUDIT_LOGS_ACCESSED', req.user.id, {
      filters: req.query,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        logs: logs,
        total: logs.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs',
      error: error.message
    });
  }
});

/**
 * GET /api/analytics/export/:type
 * Export report as PDF/CSV
 */
router.get('/export/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const report = await analyticsService.generateReport(type, req.query);
    
    // Simple CSV export (in production, use proper PDF/Excel libraries)
    const csvData = this.convertToCSV(report.data);
    
    auditService.logAction('REPORT_EXPORTED', req.user.id, {
      reportType: type,
      format: 'csv',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}_report.csv"`);
    res.send(csvData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data || typeof data !== 'object') return '';
  
  const headers = Object.keys(data);
  const rows = [headers.join(',')];
  
  // Simple CSV conversion (enhance for complex data)
  if (Array.isArray(data)) {
    data.forEach(item => {
      const values = headers.map(header => item[header] || '');
      rows.push(values.join(','));
    });
  } else {
    const values = headers.map(header => data[header] || '');
    rows.push(values.join(','));
  }
  
  return rows.join('\n');
}

export default router;