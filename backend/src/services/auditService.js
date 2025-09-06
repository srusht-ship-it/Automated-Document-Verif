import fs from 'fs';
import path from 'path';

class AuditService {
  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'audit.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  async logAction(action, userId, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: action,
      userId: userId,
      userAgent: details.userAgent || 'Unknown',
      ipAddress: details.ipAddress || 'Unknown',
      details: details.data || {},
      sessionId: details.sessionId || null,
      success: details.success !== false
    };

    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.logFile, logLine);
      
      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 AUDIT:', logEntry);
      }
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  async getAuditLogs(filters = {}) {
    try {
      const logs = fs.readFileSync(this.logFile, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .reverse(); // Most recent first

      let filteredLogs = logs;

      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }

      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action.includes(filters.action));
      }

      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
      }

      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
      }

      return filteredLogs.slice(0, filters.limit || 100);
    } catch (error) {
      console.error('Failed to read audit logs:', error);
      return [];
    }
  }
}

export default new AuditService();