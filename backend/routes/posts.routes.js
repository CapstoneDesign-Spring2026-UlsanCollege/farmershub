const express = require('express');
const router = express.Router();
const { createPost, getPosts, updatePost, toggleLike, deletePost } = require('../controllers/postController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploader, withUploadFolder } = require('../middleware/upload');

// GET  /api/posts            — public feed
router.get('/', getPosts);

// POST /api/posts            — create post (farmer only)
router.post(
  '/',
  protect,
  authorize('farmer'),
  withUploadFolder('posts'),
  uploader.array('images', 4),
  createPost
);

// PUT  /api/posts/:id         — update post (author)
router.put('/:id', protect, authorize('farmer', 'admin'), withUploadFolder('posts'), uploader.array('images', 4), updatePost);

// POST /api/posts/:id/like   — toggle like (any authenticated user)
router.post('/:id/like', protect, toggleLike);

// DELETE /api/posts/:id      — delete post (author or admin)
router.delete('/:id', protect, authorize('farmer', 'admin'), deletePost);

module.exports = router;
