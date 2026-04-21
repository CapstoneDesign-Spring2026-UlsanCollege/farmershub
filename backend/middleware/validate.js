const { validationResult, body } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Runs after validation chains. Returns 422 if any field failed.
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => `${e.path}: ${e.msg}`).join('; ');
    return errorResponse(res, messages, 422);
  }
  next();
};

// ── Auth validation chains ────────────────────────────────────────────────────
const registerRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['buyer', 'farmer'])
    .withMessage("Role must be 'buyer' or 'farmer'"),
  handleValidation,
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

// ── Product validation chains ─────────────────────────────────────────────────
const createProductRules = [
  body('title').trim().notEmpty().withMessage('Product title is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .isIn([
      'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Poultry',
      'Herbs', 'Organic', 'Bulk Supply', 'Farm Tools', 'Seedlings', 'Other',
    ])
    .withMessage('Invalid category'),
  handleValidation,
];

// ── Post validation chains ────────────────────────────────────────────────────
const createPostRules = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Post content is required')
    .isLength({ max: 2000 })
    .withMessage('Post content cannot exceed 2000 characters'),
  handleValidation,
];

// ── Message validation chains ─────────────────────────────────────────────────
const sendMessageRules = [
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
  handleValidation,
];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  createProductRules,
  createPostRules,
  sendMessageRules,
};
