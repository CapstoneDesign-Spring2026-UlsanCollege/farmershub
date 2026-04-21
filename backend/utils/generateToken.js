const jwt = require('jsonwebtoken');

/**
 * Signs and returns a JWT for the given user ID.
 * @param {string} id - MongoDB ObjectId as string
 * @returns {string} signed JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = generateToken;
