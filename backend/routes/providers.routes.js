const express = require('express');
const router = express.Router();
const {
  getProviderProfile,
  updateProviderProfile,
  getProviderPublicProfile,
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/profile', protect, authorize('provider'), getProviderProfile);
router.put('/profile', protect, authorize('provider'), updateProviderProfile);
router.get('/:id', protect, authorize('farmer', 'provider', 'admin'), getProviderPublicProfile);

module.exports = router;
