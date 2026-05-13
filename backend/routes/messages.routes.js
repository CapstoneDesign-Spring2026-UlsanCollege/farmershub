const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  getConversations
} = require('../controllers/messageController');

router.get('/conversations', protect, getConversations);

module.exports = router;
