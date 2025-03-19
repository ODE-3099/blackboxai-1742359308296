const { pool } = require('../config/db');
const { logger } = require('../utils/logger');

// Get fraud awareness materials
const getFraudMaterials = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM fraud_materials ORDER BY created_at DESC'
    );

    res.json({
      materials: result.rows
    });
  } catch (error) {
    logger.error('Error fetching fraud materials:', error);
    next(error);
  }
};

// Submit a fraud report
const submitFraudReport = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      fraudType, 
      evidenceUrls, 
      location 
    } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO fraud_reports 
       (user_id, title, description, fraud_type, evidence_urls, location, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [userId, title, description, fraudType, evidenceUrls, location, 'pending']
    );

    logger.info(`New fraud report submitted by user ${userId}`);

    res.status(201).json({
      message: 'Fraud report submitted successfully',
      report: result.rows[0]
    });
  } catch (error) {
    logger.error('Error submitting fraud report:', error);
    next(error);
  }
};

// Get user's fraud reports
const getUserReports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT * FROM fraud_reports WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      reports: result.rows
    });
  } catch (error) {
    logger.error('Error fetching user reports:', error);
    next(error);
  }
};

// Get all fraud reports (admin only)
const getAllReports = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT fr.*, u.username, u.email 
       FROM fraud_reports fr 
       JOIN users u ON fr.user_id = u.id 
       ORDER BY fr.created_at DESC`
    );

    res.json({
      reports: result.rows
    });
  } catch (error) {
    logger.error('Error fetching all reports:', error);
    next(error);
  }
};

// Update report status (admin only)
const updateReportStatus = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    const result = await pool.query(
      `UPDATE fraud_reports 
       SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
      [status, adminNotes, reportId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    logger.info(`Report ${reportId} status updated to ${status}`);

    res.json({
      message: 'Report status updated successfully',
      report: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating report status:', error);
    next(error);
  }
};

// Get fraud statistics (admin only)
const getFraudStats = async (req, res, next) => {
  try {
    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total_reports,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reports,
        COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_reports,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_reports,
        fraud_type,
        DATE_TRUNC('month', created_at) as month
       FROM fraud_reports
       GROUP BY fraud_type, DATE_TRUNC('month', created_at)
       ORDER BY month DESC`
    );

    res.json({
      statistics: stats.rows
    });
  } catch (error) {
    logger.error('Error fetching fraud statistics:', error);
    next(error);
  }
};

module.exports = {
  getFraudMaterials,
  submitFraudReport,
  getUserReports,
  getAllReports,
  updateReportStatus,
  getFraudStats
};
