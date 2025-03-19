const express = require('express');
const { body, validationResult } = require('express-validator');
const { register, login, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Register validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
];

// Login validation rules
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
