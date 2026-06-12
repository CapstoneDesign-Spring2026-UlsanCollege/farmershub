const express = require('express');
const { getMyOrders } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my', protect, authorize('customer'), getMyOrders);

module.exports = router;
