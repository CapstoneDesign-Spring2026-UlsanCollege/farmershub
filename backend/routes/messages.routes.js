const express = require('express');
const router = express.Router();
const {
  getUserMessages,
  sendMessage,
  markMessageAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const { messageUploader, withUploadFolder } = require('../middleware/upload');
const { sendMessageRules } = require('../middleware/validate');

// GET /api/messages — get user's messages/conversations
router.get('/', protect, getUserMessages);

// POST /api/messages — send a new message
router.post(
  '/',
  protect,
  withUploadFolder('messages'),
  ...messageUploader.array('attachments', 5),
  ...sendMessageRules,
  sendMessage
);

// PUT /api/messages/:id/read — mark message as read
router.put('/:id/read', protect, markMessageAsRead);

module.exports = router;
