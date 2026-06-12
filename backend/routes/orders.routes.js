const express = require('express');
const router = express.Router();
const { getMyOrders, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/orders/my — customer's own orders
router.get('/my', protect, authorize('customer'), getMyOrders);

// GET /api/orders — farmer sees received orders, customer sees placed orders, admin sees all
router.get('/', protect, authorize('farmer', 'customer', 'admin'), getOrders);

// PUT /api/orders/:id/status — farmer or admin updates order status
router.put('/:id/status', protect, authorize('farmer', 'admin'), updateOrderStatus);

module.exports = router;
