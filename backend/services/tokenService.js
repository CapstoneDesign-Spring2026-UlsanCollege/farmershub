const jwt = require('jsonwebtoken');

function getJwtSecret() {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET must be configured before signing or verifying tokens.');
    }
    return process.env.JWT_SECRET;
}

function signAuthToken(user) {
    return jwt.sign(
        { sub: String(user.id || user._id), email: user.email, role: user.role },
        getJwtSecret(),
        { expiresIn: '7d' }
    );
}

function verifyAuthToken(token) {
    return jwt.verify(token, getJwtSecret());
}

module.exports = {
    signAuthToken,
    verifyAuthToken,
};
