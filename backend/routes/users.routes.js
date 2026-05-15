const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deactivateUser,
} = require('../controllers/userController');
const {
  getCurrentProfile,
  getProfileById,
  updateCurrentProfile,
  uploadAvatar,
  uploadCover,
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploader, withUploadFolder } = require('../middleware/upload');
const User = require('../models/User');
const { successResponse } = require('../utils/apiResponse');

// ── Public role-filtered lists (used by dashboard — no auth required for browsing) ──
// GET /api/users/farmers  — list all farmer accounts
router.get('/farmers', async (req, res, next) => {
  try {
    const farmers = await User.find({ role: 'farmer', isActive: true }, '-password').sort({ createdAt: -1 });
    return successResponse(res, 'Farmers list', farmers);
  } catch (err) { next(err); }
});

// GET /api/users/customers  — list all buyer accounts (legacy name for compatibility)
router.get('/customers', async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer', isActive: true }, '-password').sort({ createdAt: -1 });
    return successResponse(res, 'Customers list', customers);
  } catch (err) { next(err); }
});

// ── All routes below require authentication ───────────────────────────────────
router.use(protect);

// GET  /api/users/profile   — current user's profile
router.get('/profile', getCurrentProfile);
router.get('/:id/profile', getProfileById);

// PUT  /api/users/profile   — update current user's profile
router.put('/profile', updateCurrentProfile);

// POST /api/users/avatar    — upload profile picture
router.post('/avatar', withUploadFolder('profiles'), uploader.single('avatar'), uploadAvatar);

// POST /api/users/cover     — upload profile cover image
router.post('/cover', withUploadFolder('profiles'), uploader.single('cover'), uploadCover);

// ── Admin only ────────────────────────────────────────────────────────────────
// GET  /api/users           — list all users
router.get('/', authorize('admin'), getAllUsers);

// DELETE /api/users/:id     — deactivate a user (soft delete)
router.delete('/:id', authorize('admin'), deactivateUser);

module.exports = router;

