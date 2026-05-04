const express = require('express');
const jwt = require('jsonwebtoken');

function createAuthRouter(store) {
  const router = express.Router();

  function signToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      },
      process.env.JWT_SECRET || 'farmershub-dev-secret',
      { expiresIn: '7d' }
    );
  }

  router.post('/register', async (req, res) => {
    try {
      const payload = req.body || {};
      const required = ['email', 'password', 'role', 'fullName', 'age', 'gender', 'address', 'paymentMethod'];

      const missing = required.find((field) => !payload[field]);
      if (missing || !(payload.phone || payload.contact)) {
        return res.status(400).json({
          success: false,
          message: 'All required fields must be provided.'
        });
      }

      if (!['farmer', 'customer'].includes(String(payload.role).trim())) {
        return res.status(400).json({
          success: false,
          message: 'Role must be farmer or customer.'
        });
      }

      if (Number(payload.age) < 16) {
        return res.status(400).json({
          success: false,
          message: 'You must be at least 16 years old.'
        });
      }

      const result = await store.registerUser(payload);
      if (result.error) {
        return res.status(result.error.status).json({
          success: false,
          message: result.error.message
        });
      }

      const token = signToken(result.user);
      return res.status(201).json({
        success: true,
        message: 'Registration successful.',
        token,
        user: result.user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error during registration.'
      });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      const result = await store.login(email, password);
      if (result.error) {
        return res.status(result.error.status).json({
          success: false,
          message: result.error.message
        });
      }

      const token = signToken(result.user);
      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: result.user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error during login.'
      });
    }
  });

  router.post('/logout', (req, res) => {
    return res.status(200).json({
      success: true,
      message: 'Logout successful.'
    });
  });

  return router;
}

module.exports = createAuthRouter;