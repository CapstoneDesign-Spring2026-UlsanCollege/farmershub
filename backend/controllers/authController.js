const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * POST /api/auth/register
 * Creates a new user account (buyer or farmer).
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, phone, address } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return errorResponse(res, 'An account with that email already exists', 409);
    }

    const user = await User.create({ fullName, email, password, role, phone, address });
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

    // Include password field (excluded by default in schema)
    const user = await User.findOne({ email }).select('+password');
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
