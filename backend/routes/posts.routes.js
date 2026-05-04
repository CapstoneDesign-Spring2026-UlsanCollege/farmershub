const express = require('express');
const router = express.Router();
const { createPost, getFeed, likePost, deletePost } = require('../controllers/postController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { createPostRules } = require('../middleware/validate');

// GET  /api/posts            — public feed
router.get('/', getFeed);

// POST /api/posts            — create post (farmer only)
router.post(
  '/',
  protect,
  authorize('farmer'),
  upload.array('images', 4),
  createPostRules,
  createPost
);

// POST /api/posts/:id/like   — toggle like (any authenticated user)
router.post('/:id/like', protect, likePost);

// DELETE /api/posts/:id      — delete post (author or admin)
router.delete('/:id', protect, authorize('farmer', 'admin'), deletePost);

module.exports = router;
