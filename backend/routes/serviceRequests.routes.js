const express = require('express');
const router = express.Router();
const {
  listServiceRequests,
  getServiceRequestById,
  createServiceRequest,
  quoteServiceRequest,
  declineServiceRequest,
  acceptServiceRequestQuote,
  cancelServiceRequest,
  completeServiceRequest,
} = require('../controllers/serviceRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('farmer', 'provider', 'admin'), listServiceRequests);
router.get('/:id', protect, authorize('farmer', 'provider', 'admin'), getServiceRequestById);
router.post('/', protect, authorize('farmer'), createServiceRequest);
router.put('/:id/quote', protect, authorize('provider'), quoteServiceRequest);
router.put('/:id/decline', protect, authorize('provider'), declineServiceRequest);
router.put('/:id/accept', protect, authorize('farmer'), acceptServiceRequestQuote);
router.put('/:id/cancel', protect, authorize('farmer'), cancelServiceRequest);
router.put('/:id/complete', protect, authorize('provider'), completeServiceRequest);

module.exports = router;
