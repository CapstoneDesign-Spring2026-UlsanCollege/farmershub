const express = require('express');
const { createPost, getPosts, updatePost, toggleLike, deletePost } = require('../controllers/postController');
const { requireAuth } = require('../middleware/auth');
const { uploader, withUploadFolder } = require('../middleware/upload');

const router = express.Router();

router.get('/', getPosts);
router.post('/', requireAuth, withUploadFolder('posts'), uploader.array('images', 4), createPost);
router.put('/:id', requireAuth, withUploadFolder('posts'), uploader.array('images', 4), updatePost);
router.post('/:id/like', requireAuth, toggleLike);
router.delete('/:id', requireAuth, deletePost);

module.exports = router;