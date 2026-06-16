const express = require('express');
const router = express.Router();
const {
  listMine,
  listAvailable,
  createPartner,
  updatePartner,
  deletePartner,
} = require('../controllers/deliveryPartnerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Provider-managed delivery options.
router.get('/mine', protect, authorize('provider'), listMine);
router.post('/', protect, authorize('provider'), createPartner);
router.patch('/:id', protect, authorize('provider'), updatePartner);
router.delete('/:id', protect, authorize('provider'), deletePartner);

// Farmers browse active options when shipping an order.
router.get('/available', protect, authorize('farmer', 'admin'), listAvailable);

module.exports = router;
