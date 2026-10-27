const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Register
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters.')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, underscores.'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ],
  validate,
  register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  login
);

// Get current user
router.get('/me', authenticate, getMe);

// Update profile
router.put(
  '/me',
  authenticate,
  [body('username').trim().isLength({ min: 3, max: 20 }).optional()],
  validate,
  updateProfile
);

module.exports = router;
