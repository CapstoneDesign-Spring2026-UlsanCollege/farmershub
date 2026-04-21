const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getCurrentProfile, getProfileById, updateCurrentProfile, uploadAvatar, uploadCover } = require('../controllers/profileController');
const { requireAuth } = require('../middleware/auth');
const { uploader, withUploadFolder } = require('../middleware/upload');

// GET /api/users/farmers
router.get('/farmers', async (req, res) => {
    try {
        const farmers = await User.find({ role: 'farmer' }, '-password').sort({ createdAt: -1 });
        return res.json({ success: true, data: farmers });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/users/customers
router.get('/customers', async (req, res) => {
    try {
        const customers = await User.find({ role: 'customer' }, '-password').sort({ createdAt: -1 });
        return res.json({ success: true, data: customers });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

router.get('/profile', requireAuth, getCurrentProfile);
router.get('/profile/:id', getProfileById);
router.put('/profile', requireAuth, updateCurrentProfile);
router.post('/avatar', requireAuth, withUploadFolder('profiles'), uploader.single('avatar'), uploadAvatar);
router.post('/cover', requireAuth, withUploadFolder('profiles'), uploader.single('cover'), uploadCover);

module.exports = router;
