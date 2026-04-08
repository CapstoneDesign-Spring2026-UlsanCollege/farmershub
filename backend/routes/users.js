const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');
const Customer = require('../models/Customer');

// GET /api/users/farmers
router.get('/farmers', async (req, res) => {
    try {
        const farmers = await Farmer.find({}, '-password').sort({ createdAt: -1 });
        return res.json({ success: true, data: farmers });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/users/customers
router.get('/customers', async (req, res) => {
    try {
        const customers = await Customer.find({}, '-password').sort({ createdAt: -1 });
        return res.json({ success: true, data: customers });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
