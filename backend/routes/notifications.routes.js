const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/notifications - get user's notifications with pagination
router.get('/', protect, getUserNotifications);

// PUT /api/notifications/read-all - mark all user's notifications as read
router.put('/read-all', protect, markAllAsRead);

// PUT /api/notifications/:id/read - mark specific notification as read
router.put('/:id/read', protect, markAsRead);


module.exports = router;
