const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is required.'
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'farmershub-dev-secret');
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
}

module.exports = authRequired;