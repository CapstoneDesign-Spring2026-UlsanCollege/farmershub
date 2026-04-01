const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');
const Customer = require('../models/Customer');

function getModel(role) {
    if (role === 'farmer') return Farmer;
    if (role === 'customer') return Customer;
    return null;
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password, role, fullName, age, gender, address, contact, paymentMethod } = req.body;

        if (!email || !password || !fullName || !age || !gender || !address || !contact || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        if (age < 16) {
            return res.status(400).json({ success: false, message: 'You must be at least 16 years old.' });
        }

        const Model = getModel(role);
        if (!Model) {
            return res.status(400).json({ success: false, message: 'Please select a role (farmer or customer).' });
        }

        const existing = await Model.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: 'User already exists.' });
        }

        const user = new Model({ email, password, fullName, age, gender, address, contact, paymentMethod });
        await user.save();

        return res.status(201).json({ success: true, message: 'Signup successful! Please login.' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const Model = getModel(role);
        if (!Model) {
            return res.status(400).json({ success: false, message: 'Please select a role (farmer or customer).' });
        }

        const user = await Model.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        return res.status(200).json({ success: true, message: 'Login successful', user: { email: user.email, role } });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
