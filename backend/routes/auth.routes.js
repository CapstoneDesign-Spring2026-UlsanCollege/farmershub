const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerRules, loginRules } = require('../middleware/validate');

// POST /api/auth/register
router.post('/register', registerRules, register);

// POST /api/auth/login
router.post('/login', loginRules, login);

// GET /api/auth/me  (protected)
router.get('/me', protect, getMe);

module.exports = router;
