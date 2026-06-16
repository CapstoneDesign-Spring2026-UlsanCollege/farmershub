const express = require('express');
const router = express.Router();
const {
  getWallet,
  createRechargeRequest,
  getMyRechargeRequests,
} = require('../controllers/walletController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Wallet is available to every signed-in role except the admin (who funds the system).
router.get('/', protect, getWallet);

router.post('/recharge-requests', protect, authorize('customer', 'farmer', 'provider'), createRechargeRequest);
router.get('/recharge-requests', protect, authorize('customer', 'farmer', 'provider'), getMyRechargeRequests);

module.exports = router;
