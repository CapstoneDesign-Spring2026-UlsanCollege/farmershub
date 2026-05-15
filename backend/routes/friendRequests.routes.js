const express = require('express');
const router = express.Router();
const { getFriendRequests, sendFriendRequest } = require('../controllers/friendRequestController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getFriendRequests);
router.post('/', protect, sendFriendRequest);

module.exports = router;
