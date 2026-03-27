const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User already exists.' });
        }

        const user = new User({ email, password });
        await user.save();

        return res.status(201).json({ success: true, message: 'Signup successful! Please login.' });
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

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        return res.status(200).json({ success: true, message: 'Login successful', user: { email: user.email } });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
