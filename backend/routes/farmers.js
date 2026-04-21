const express = require('express');
const { listFarmers, getFarmerById } = require('../controllers/farmerController');
const { updateFarmerProfile } = require('../controllers/profileController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', listFarmers);
router.get('/:id', getFarmerById);
router.put('/profile', requireAuth, requireRole('farmer'), updateFarmerProfile);

module.exports = router;