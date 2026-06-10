const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { ADMIN_EMAIL, ensureAdminAccount } = require('../services/adminAccountService');

/**
 * POST /api/auth/register
 * Creates a new user account (buyer or farmer).
 */
const register = async (req, res, next) => {
  try {
    const {
      fullName, email, password,
      role: rawRole,
      phone, contact,  // accept 'contact' as alias for 'phone'
      address, age, gender, paymentMethod,
    } = req.body;

    const role = rawRole === 'buyer' ? 'customer' : (rawRole || 'customer');
    // Normalize phone field
    const phoneNorm = phone || contact || '';

    const existing = await User.findOne({ email });
    if (existing) {
      return errorResponse(res, 'An account with that email already exists', 409);
    }

    const user = await User.create({
      fullName, email, password, role,
      phone: phoneNorm, address, age, gender, paymentMethod,
    });
    const token = generateToken(user._id);

    return successResponse(res, 'Account created successfully', { token, user }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Authenticates user and returns a JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (normalizedEmail === ADMIN_EMAIL) {
      await ensureAdminAccount();
    }

    // Include password field (excluded by default in schema)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user._id);

    // Strip password from returned object
    user.password = undefined;

    return successResponse(res, 'Login successful', { token, user });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user.
 */
const getMe = async (req, res) => {
  return successResponse(res, 'Current user', req.user);
};

module.exports = { register, login, getMe };
