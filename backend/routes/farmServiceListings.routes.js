const express = require('express');
const router = express.Router();
const {
  listFarmServiceListings,
  getFarmServiceListingById,
  createFarmServiceListing,
  updateFarmServiceListing,
  setListingActiveState,
} = require('../controllers/farmServiceListingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('farmer', 'provider', 'admin'), listFarmServiceListings);
router.get('/:id', protect, authorize('farmer', 'provider', 'admin'), getFarmServiceListingById);
router.post('/', protect, authorize('provider'), createFarmServiceListing);
router.put('/:id', protect, authorize('provider', 'admin'), updateFarmServiceListing);
router.put('/:id/:state(activate|deactivate)', protect, authorize('provider', 'admin'), setListingActiveState);

module.exports = router;
