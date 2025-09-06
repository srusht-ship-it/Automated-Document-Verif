import { Document, User } from '../models/index.js';
import auditService from './auditService.js';
import fs from 'fs';
import path from 'path';

class AnalyticsService {
  constructor() {
    this.metricsCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async getDashboardAnalytics(userId, userRole) {
    const cacheKey = `dashboard_${userId}_${userRole}`;
    const cached = this.metricsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const analytics = {
        overview: await this.getOverviewMetrics(userId, userRole),
        charts: await this.getChartData(userId, userRole),
        trends: await this.getTrendAnalysis(userId, userRole),
        performance: await this.getPerformanceMetrics(),
        fraudDetection: await this.getFraudAnalytics(),
        userActivity: await this.getUserActivityMetrics(userId)
      };

      // Cache results
      this.metricsCache.set(cacheKey, {
        data: analytics,
        timestamp: Date.now()
      });

      return analytics;
    } catch (error) {
      console.error('Analytics error:', error);
      return null;
    }
  }

  async getOverviewMetrics(userId, userRole) {
    const whereCondition = {};
    
    if (userRole === 'issuer') {
      whereCondition.issuerId = userId;
    } else if (userRole === 'individual') {
      whereCondition.individualId = userId;
    }

    const [total, pending, verified, rejected] = await Promise.all([
      Document.count({ where: whereCondition }),
      Document.count({ where: { ...whereCondition, status: 'pending' } }),
      Document.count({ where: { ...whereCondition, status: 'verified' } }),
      Document.count({ where: { ...whereCondition, status: 'rejected' } })
    ]);

    const verificationRate = total > 0 ? ((verified + rejected) / total * 100).toFixed(1) : 0;
    const successRate = (verified + rejected) > 0 ? (verified / (verified + rejected) * 100).toFixed(1) : 0;

    return {
      total,
      pending,
      verified,
      rejected,
      verificationRate: parseFloat(verificationRate),
      successRate: parseFloat(successRate)
    };
  }

  async getChartData(userId, userRole) {
    const whereCondition = {};
    
    if (userRole === 'issuer') {
      whereCondition.issuerId = userId;
    } else if (userRole === 'individual') {
      whereCondition.individualId = userId;
    }

    // Last 30 days data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const documents = await Document.findAll({
      where: {
        ...whereCondition,
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      order: [['created_at', 'ASC']]
    });

    // Group by date
    const dailyData = {};
    documents.forEach(doc => {
      const date = doc.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { uploads: 0, verified: 0, rejected: 0 };
      }
      dailyData[date].uploads++;
      if (doc.status === 'verified') dailyData[date].verified++;
      if (doc.status === 'rejected') dailyData[date].rejected++;
    });

    return {
      daily: Object.entries(dailyData).map(([date, data]) => ({
        date,
        ...data
      })),
      statusDistribution: {
        pending: documents.filter(d => d.status === 'pending').length,
        verified: documents.filter(d => d.status === 'verified').length,
        rejected: documents.filter(d => d.status === 'rejected').length
      }
    };
  }

  async getTrendAnalysis(userId, userRole) {
    // Compare current month vs previous month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const whereCondition = {};
    if (userRole === 'issuer') whereCondition.issuerId = userId;
    else if (userRole === 'individual') whereCondition.individualId = userId;

    const [currentMonth, previousMonth] = await Promise.all([
      Document.count({
        where: {
          ...whereCondition,
          created_at: { [Op.gte]: currentMonthStart }
        }
      }),
      Document.count({
        where: {
          ...whereCondition,
          created_at: {
            [Op.gte]: previousMonthStart,
            [Op.lte]: previousMonthEnd
          }
        }
      })
    ]);

    const growth = previousMonth > 0 
      ? ((currentMonth - previousMonth) / previousMonth * 100).toFixed(1)
      : currentMonth > 0 ? 100 : 0;

    return {
      currentMonth,
      previousMonth,
      growth: parseFloat(growth),
      trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable'
    };
  }

  async getPerformanceMetrics() {
    const auditLogs = await auditService.getAuditLogs({ limit: 1000 });
    
    const responseTime = auditLogs
      .filter(log => log.details.responseTime)
      .reduce((sum, log) => sum + log.details.responseTime, 0) / auditLogs.length || 0;

    const errorRate = auditLogs.filter(log => !log.success).length / auditLogs.length * 100 || 0;

    return {
      avgResponseTime: Math.round(responseTime),
      errorRate: parseFloat(errorRate.toFixed(2)),
      totalRequests: auditLogs.length,
      uptime: process.uptime()
    };
  }

  async getFraudAnalytics() {
    const documents = await Document.findAll({
      where: {
        metadata: {
          mlFraudAnalysis: { [Op.ne]: null }
        }
      }
    });

    const fraudScores = documents
      .map(doc => doc.metadata?.mlFraudAnalysis?.fraudScore || 0)
      .filter(score => score > 0);

    const avgFraudScore = fraudScores.length > 0 
      ? fraudScores.reduce((a, b) => a + b, 0) / fraudScores.length 
      : 0;

    const highRiskDocs = documents.filter(doc => 
      (doc.metadata?.mlFraudAnalysis?.fraudScore || 0) > 50
    ).length;

    return {
      totalAnalyzed: documents.length,
      avgFraudScore: parseFloat(avgFraudScore.toFixed(2)),
      highRiskDocuments: highRiskDocs,
      fraudDetectionRate: documents.length > 0 
        ? (highRiskDocs / documents.length * 100).toFixed(1) 
        : 0
    };
  }

  async getUserActivityMetrics(userId) {
    const auditLogs = await auditService.getAuditLogs({ 
      userId: userId, 
      limit: 100 
    });

    const actionCounts = {};
    auditLogs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    const lastActivity = auditLogs.length > 0 ? auditLogs[0].timestamp : null;

    return {
      totalActions: auditLogs.length,
      actionBreakdown: actionCounts,
      lastActivity: lastActivity,
      sessionsToday: auditLogs.filter(log => 
        log.action === 'LOGIN_SUCCESS' && 
        new Date(log.timestamp).toDateString() === new Date().toDateString()
      ).length
    };
  }

  async generateReport(type, filters = {}) {
    const reportData = {
      generatedAt: new Date().toISOString(),
      type: type,
      filters: filters,
      data: {}
    };

    switch (type) {
      case 'usage':
        reportData.data = await this.generateUsageReport(filters);
        break;
      case 'fraud':
        reportData.data = await this.generateFraudReport(filters);
        break;
      case 'performance':
        reportData.data = await this.generatePerformanceReport(filters);
        break;
      case 'audit':
        reportData.data = await this.generateAuditReport(filters);
        break;
      default:
        throw new Error('Invalid report type');
    }

    return reportData;
  }

  async generateUsageReport(filters) {
    const whereCondition = {};
    if (filters.startDate) whereCondition.created_at = { [Op.gte]: new Date(filters.startDate) };
    if (filters.endDate) whereCondition.created_at = { ...whereCondition.created_at, [Op.lte]: new Date(filters.endDate) };

    const documents = await Document.findAll({ where: whereCondition });
    const users = await User.findAll();

    return {
      totalDocuments: documents.length,
      totalUsers: users.length,
      documentsByType: this.groupBy(documents, 'metadata.documentType'),
      documentsByStatus: this.groupBy(documents, 'status'),
      usersByRole: this.groupBy(users, 'role')
    };
  }

  async generateFraudReport(filters) {
    const documents = await Document.findAll({
      where: {
        metadata: { mlFraudAnalysis: { [Op.ne]: null } }
      }
    });

    const fraudAnalysis = documents.map(doc => ({
      id: doc.id,
      fraudScore: doc.metadata?.mlFraudAnalysis?.fraudScore || 0,
      flags: doc.metadata?.mlFraudAnalysis?.flags || [],
      confidence: doc.metadata?.mlFraudAnalysis?.confidence || 0
    }));

    return {
      totalAnalyzed: documents.length,
      highRisk: fraudAnalysis.filter(d => d.fraudScore > 70).length,
      mediumRisk: fraudAnalysis.filter(d => d.fraudScore > 30 && d.fraudScore <= 70).length,
      lowRisk: fraudAnalysis.filter(d => d.fraudScore <= 30).length,
      commonFlags: this.getCommonFlags(fraudAnalysis)
    };
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const value = key.split('.').reduce((obj, k) => obj?.[k], item) || 'unknown';
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }

  getCommonFlags(fraudAnalysis) {
    const flagCounts = {};
    fraudAnalysis.forEach(analysis => {
      analysis.flags.forEach(flag => {
        flagCounts[flag] = (flagCounts[flag] || 0) + 1;
      });
    });
    return Object.entries(flagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  }
}

export default new AnalyticsService();