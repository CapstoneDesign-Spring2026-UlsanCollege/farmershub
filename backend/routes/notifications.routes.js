const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { createNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/notifications - get user's notifications with pagination
router.get('/', protect, getUserNotifications);

// PUT /api/notifications/read-all - mark all user's notifications as read
router.put('/read-all', protect, markAllAsRead);

// PUT /api/notifications/:id/read - mark specific notification as read
router.put('/:id/read', protect, markAsRead);

// POST /api/notifications/test - create a test notification
router.post('/test', protect, async (req, res, next) => {
  try {
    const testNotification = await createNotification(
      req.user._id,
      'system',
      'Test Notification',
      'This is a test notification to verify the notification system is working.',
      null,
      null
    );

    return res.status(201).json({
      success: true,
      message: 'Test notification created',
      data: testNotification,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
