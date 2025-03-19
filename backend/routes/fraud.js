const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const {
  getFraudMaterials,
  submitFraudReport,
  getUserReports,
  getAllReports,
  updateReportStatus,
  getFraudStats
} = require('../controllers/fraudController');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Fraud report validation rules
const fraudReportValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters long'),
  body('fraudType')
    .trim()
    .notEmpty()
    .withMessage('Fraud type is required')
    .isIn(['sms', 'call', 'ss7', 'other'])
    .withMessage('Invalid fraud type'),
  body('evidenceUrls')
    .isArray()
    .withMessage('Evidence URLs must be an array'),
  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location cannot be empty if provided')
];

// Status update validation rules
const statusUpdateValidation = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'verified', 'resolved', 'rejected'])
    .withMessage('Invalid status'),
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Admin notes must be at least 10 characters long if provided')
];

// Public routes
router.get('/materials', getFraudMaterials);

// Protected routes (require authentication)
router.use(authenticateToken);

router.post('/report', fraudReportValidation, validate, submitFraudReport);
router.get('/user-reports', getUserReports);

// Admin routes
router.get('/all-reports', isAdmin, getAllReports);
router.put('/reports/:reportId/status', 
  isAdmin, 
  statusUpdateValidation, 
  validate, 
  updateReportStatus
);
router.get('/statistics', isAdmin, getFraudStats);

module.exports = router;
