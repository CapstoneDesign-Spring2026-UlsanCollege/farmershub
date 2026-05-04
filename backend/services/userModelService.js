const User = require('../models/User');

function getUserModelByRole(role) {
    if (['farmer', 'customer', 'admin'].includes(role)) return User;
    return User;
}

async function findUserById(id) {
    return User.findById(id);
}

async function findUserByEmail(email) {
    if (!email) return null;
    return User.findOne({ email: String(email).trim().toLowerCase() });
}

async function findUserAcrossRolesById(id) {
    return User.findById(id);
}

function normalizeBaseUser(userDoc, role) {
    if (!userDoc) return null;
    const resolvedRole = role || userDoc.role;

    return {
        id: String(userDoc._id),
        fullName: userDoc.fullName,
        email: userDoc.email,
        role: resolvedRole,
        age: userDoc.age,
        gender: userDoc.gender,
        address: userDoc.address,
        phone: userDoc.phone,
        paymentMethod: userDoc.paymentMethod,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
    };
}

module.exports = {
    User,
    getUserModelByRole,
    findUserById,
    findUserByEmail,
    findUserAcrossRolesById,
    normalizeBaseUser,
};