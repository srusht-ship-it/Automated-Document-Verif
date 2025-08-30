const { Document, User } = require('../models');
const { Op } = require('sequelize');

// Get analytics data for issuer
const getIssuerAnalytics = async (req, res) => {
  try {
    const issuerId = req.user.id;
    
    // Get document counts by status
    const totalIssued = await Document.count({ where: { issuerId } });
    const verified = await Document.count({ where: { issuerId, status: 'verified' } });
    const pending = await Document.count({ where: { issuerId, status: 'pending' } });
    const rejected = await Document.count({ where: { issuerId, status: 'rejected' } });
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentDocuments = await Document.findAll({
      where: {
        issuerId,
        createdAt: { [Op.gte]: sevenDaysAgo }
      },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        totalIssued,
        verified,
        pending,
        rejected,
        successRate: totalIssued > 0 ? Math.round((verified / totalIssued) * 100) : 0,
        recentDocuments: recentDocuments.length
      }
    });
  } catch (error) {
    console.error('Get issuer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

// Get analytics data for verifier
const getVerifierAnalytics = async (req, res) => {
  try {
    const totalPending = await Document.count({ where: { status: 'pending' } });
    const totalVerified = await Document.count({ where: { status: 'verified' } });
    const totalRejected = await Document.count({ where: { status: 'rejected' } });
    
    res.json({
      success: true,
      data: {
        pendingQueue: totalPending,
        totalVerified,
        totalRejected,
        totalProcessed: totalVerified + totalRejected
      }
    });
  } catch (error) {
    console.error('Get verifier analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

module.exports = {
  getIssuerAnalytics,
  getVerifierAnalytics
};