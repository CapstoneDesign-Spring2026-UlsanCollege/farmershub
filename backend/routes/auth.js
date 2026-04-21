const express = require('express');
const router = express.Router();
const { signAuthToken } = require('../services/tokenService');
const { User, findUserByEmail, normalizeBaseUser } = require('../services/userModelService');
const { requireAuth } = require('../middleware/auth');

function normalizeIncomingRole(role) {
    if (!role) return '';
    const value = String(role).trim().toLowerCase();
    if (value === 'buyer') return 'customer';
    return value;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, role, age, gender, address, phone, paymentMethod } = req.body;
        const normalizedRole = normalizeIncomingRole(role);

        if (!fullName || !email || !password || !normalizedRole || !age || !gender || !address || !phone || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        if (age < 16) {
            return res.status(400).json({ success: false, message: 'You must be at least 16 years old.' });
        }

        if (!['customer', 'farmer', 'admin'].includes(normalizedRole)) {
            return res.status(400).json({ success: false, message: 'Role must be either customer, farmer, or admin.' });
        }

        const existing = await findUserByEmail(email);
        if (existing) {
            return res.status(409).json({ success: false, message: 'User already exists.' });
        }

        const userDoc = await User.create({
            fullName,
            email,
            password,
            role: normalizedRole,
            age,
            gender,
            address,
            phone,
            paymentMethod,
        });

        const user = normalizeBaseUser(userDoc);
        const token = signAuthToken(user);

        return res.status(201).json({
            success: true,
            message: 'Registration successful.',
            token,
            user,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const userDoc = await findUserByEmail(email);
        if (!userDoc) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const isMatch = await userDoc.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = normalizeBaseUser(userDoc);
        const token = signAuthToken(user);

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            user,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
    return res.status(200).json({
        success: true,
        data: req.user,
    });
});

module.exports = router;
