const { errorResponse } = require('../utils/apiResponse');

/**
 * Centralized error handler — placed last in app.js middleware chain.
 * Catches any error passed via next(err) or thrown in async handlers
 * (requires express-async-errors or wrapper).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for '${field}' — that value is already taken`;
    statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    statusCode = 400;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    message = `Invalid ID format for '${err.path}'`;
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Token has expired';
    statusCode = 401;
  }

  // In development, include stack trace
  const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  return errorResponse(res, message, statusCode, stack ? { stack } : undefined);
};

module.exports = errorHandler;
