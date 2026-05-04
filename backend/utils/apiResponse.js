/**
 * Standard API response helpers.
 * Ensures every response follows a consistent shape:
 *   { success, message, data? }
 */

/**
 * @param {import('express').Response} res
 * @param {string} message
 * @param {*} [data]
 * @param {number} [statusCode=200]
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
};

/**
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=500]
 * @param {*} [meta]
 */
const errorResponse = (res, message, statusCode = 500, meta = undefined) => {
  const body = { success: false, message };
  if (meta !== undefined) body.meta = meta;
  return res.status(statusCode).json(body);
};

module.exports = { successResponse, errorResponse };
