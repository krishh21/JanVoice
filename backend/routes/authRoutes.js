const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const validateEmail = (value) => {
  const email = String(value || '').trim().toLowerCase();
  const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z]{2,})+$/;

  if (!emailPattern.test(email)) {
    throw new Error('Please include a valid email');
  }

  const [localPart, domain] = email.split('@');
  const domainParts = domain.split('.');
  const provider = domainParts[0];

  if (localPart.length < 3 || provider.length < 2) {
    throw new Error('Please use a real email address');
  }

  return true;
};

// Validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').trim().toLowerCase().custom(validateEmail),
  body('phone').matches(/^\d{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  body('address').notEmpty().withMessage('Address is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email').trim().toLowerCase().custom(validateEmail),
  body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email').trim().toLowerCase().custom(validateEmail)
];

const resetPasswordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const profileValidation = [
  body('name').optional().notEmpty().withMessage('Name is required'),
  body('email').optional().trim().toLowerCase().custom(validateEmail),
  body('phone').optional().matches(/^\d{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  body('address').optional().notEmpty().withMessage('Address is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Public routes
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.put('/reset-password/:resettoken', resetPasswordValidation, resetPassword);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, profileValidation, updateUserProfile);

// Admin routes
router.get('/users', protect, authorize('admin'), getUsers);

module.exports = router;
