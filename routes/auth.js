const express = require('express');
const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    // TODO: Replace with real database lookup
    if (username === 'admin' && password === 'admin123') {
        return res.status(200).json({ success: true, message: 'Login successful', user: { username } });
    }

    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
});

module.exports = router;
