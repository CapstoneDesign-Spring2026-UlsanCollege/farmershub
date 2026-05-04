const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerRules, loginRules } = require('../middleware/validate');

// POST /api/auth/register  (also accept /signup as legacy alias)
router.post('/register', registerRules, register);
router.post('/signup', registerRules, register);  // legacy alias

// POST /api/auth/login
router.post('/login', loginRules, login);

// GET /api/auth/me  (protected)
router.get('/me', protect, getMe);

module.exports = router;
