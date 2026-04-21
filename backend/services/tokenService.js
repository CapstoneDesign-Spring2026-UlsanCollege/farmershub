const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'farmershub-dev-secret-change-me';

function signAuthToken(user) {
    return jwt.sign(
        { sub: String(user.id || user._id), email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

function verifyAuthToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = {
    signAuthToken,
    verifyAuthToken,
};