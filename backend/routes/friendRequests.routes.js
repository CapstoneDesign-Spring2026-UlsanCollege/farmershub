const express = require('express');
const router = express.Router();
const {
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
} = require('../controllers/friendRequestController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getFriendRequests);
router.post('/', protect, sendFriendRequest);
router.put('/:id/accept', protect, acceptFriendRequest);
router.put('/:id/decline', protect, declineFriendRequest);
router.put('/:id/cancel', protect, cancelFriendRequest);

module.exports = router;
