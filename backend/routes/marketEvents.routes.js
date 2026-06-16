const express = require('express');
const router = express.Router();
const {
  listMarketEvents,
  createMarketEvent,
  deleteMarketEvent,
} = require('../controllers/marketEventController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public: anyone can read upcoming local market events for the community feed.
router.get('/', listMarketEvents);

// Admin only: manage the market event listings.
router.post('/', protect, authorize('admin'), createMarketEvent);
router.delete('/:id', protect, authorize('admin'), deleteMarketEvent);

module.exports = router;
