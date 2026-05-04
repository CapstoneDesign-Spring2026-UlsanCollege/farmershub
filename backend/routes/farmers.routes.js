const express = require('express');
const router = express.Router();
const { listFarmers, getFarmerById } = require('../controllers/farmerController');
const { updateFarmerProfile } = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET  /api/farmers          — public list of farmers
router.get('/', listFarmers);

// PUT  /api/farmers/profile  — farmer updates own farm profile (protected — must be BEFORE /:id)
router.put('/profile', protect, authorize('farmer'), updateFarmerProfile);

// GET  /api/farmers/:id      — public farmer profile + products + posts
router.get('/:id', getFarmerById);

module.exports = router;
