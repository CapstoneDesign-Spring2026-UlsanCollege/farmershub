const { errorResponse } = require('../utils/apiResponse');
const { isConfiguredAdmin } = require('../services/adminAccountService');

function requireConfiguredAdmin(req, res, next) {
  if (!req.user || !isConfiguredAdmin(req.user)) {
    return errorResponse(res, 'Admin Panel access is restricted to the configured administrator account', 403);
  }

  next();
}

module.exports = { requireConfiguredAdmin };
