const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Verifies the JWT sent in the Authorization header.
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized — no token provided', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return errorResponse(res, 'Not authorized — user not found or inactive', 401);
    }

    req.user = user;
    next();
  } catch {
    return errorResponse(res, 'Not authorized — invalid or expired token', 401);
  }
};

/**
 * Role-based access guard. Use after protect().
 * Example: authorize('admin', 'farmer')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied — role '${req.user.role}' is not permitted`,
        403
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
