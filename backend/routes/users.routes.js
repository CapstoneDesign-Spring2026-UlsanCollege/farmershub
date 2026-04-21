const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  getAllUsers,
  deactivateUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// All routes below require authentication
router.use(protect);

// GET  /api/users/profile   — current user's profile
router.get('/profile', getProfile);

// PUT  /api/users/profile   — update current user's profile
router.put('/profile', updateProfile);

// POST /api/users/avatar    — upload profile picture
router.post('/avatar', upload.single('avatar'), uploadAvatar);

// ── Admin only ────────────────────────────────────────────────────────────────
// GET  /api/users           — list all users
router.get('/', authorize('admin'), getAllUsers);

// DELETE /api/users/:id     — deactivate a user (soft delete)
router.delete('/:id', authorize('admin'), deactivateUser);

module.exports = router;
