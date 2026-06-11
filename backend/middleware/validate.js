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
  // Accept both 'buyer' (legacy alias) and the supported platform roles.
  body('role')
    .optional()
    .isIn(['buyer', 'farmer', 'customer', 'provider'])
    .withMessage("Role must be 'buyer', 'farmer', 'customer', or 'provider'"),
  handleValidation,
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

// ── Product validation chains ─────────────────────────────────────────────────
// Field names match what buildProductPayload() reads from req.body.
// category is normalized to lowercase by the controller, so validate lowercase.
const createProductRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('sellingPrice')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a non-negative number'),
  body('category')
    .optional()
    .customSanitizer((v) => String(v).toLowerCase())
    .isIn([
      'vegetables', 'fruits', 'grains', 'dairy', 'poultry',
      'herbs', 'organic', 'bulk supply', 'farm tools', 'seedlings', 'other',
    ])
    .withMessage('Invalid category'),
  handleValidation,
];

// ── Post validation chains ────────────────────────────────────────────────────
// content/text/caption are all accepted aliases (controller reads all three).
// Image-only posts are valid, so content is optional — length is bounded when present.
const createPostRules = [
  body(['content', 'text', 'caption'])
    .optional({ checkFalsy: true })
    .trim()
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
