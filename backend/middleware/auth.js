const { verifyAuthToken } = require('../services/tokenService');
const { findUserById, normalizeBaseUser } = require('../services/userModelService');

async function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const [, token] = header.split(' ');

        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }

        const payload = verifyAuthToken(token);
        const userDoc = await findUserById(payload.sub);

        if (!userDoc || payload.role !== userDoc.role) {
            return res.status(401).json({ success: false, message: 'Invalid token.' });
        }

        req.auth = payload;
        req.userDoc = userDoc;
        req.user = normalizeBaseUser(userDoc, payload.role);
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
}

function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
        }
        return next();
    };
}

module.exports = {
    requireAuth,
    requireRole,
};