const express = require('express');
const router = express.Router();
const {
  getProviderProfile,
  updateProviderProfile,
  getProviderPublicProfile,
  uploadProviderAvatar,
  uploadProviderCover,
  addEquipmentImages,
  deleteEquipmentImage,
  createProviderPost,
  getMyProviderPosts,
  deleteProviderPost,
  getProviderImage,
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { memoryUploader } = require('../middleware/upload');

const onlyProvider = [protect, authorize('provider')];

router.get('/profile', onlyProvider, getProviderProfile);
router.put('/profile', onlyProvider, updateProviderProfile);

// ── Profile imagery (stored as binary documents in MongoDB) ───────────────────
router.post('/profile/avatar', onlyProvider, memoryUploader.single('avatar'), uploadProviderAvatar);
router.post('/profile/cover', onlyProvider, memoryUploader.single('cover'), uploadProviderCover);

// ── Equipment gallery ─────────────────────────────────────────────────────────
router.post('/profile/equipment', onlyProvider, memoryUploader.array('images', 10), addEquipmentImages);
router.delete('/profile/equipment/:imageId', onlyProvider, deleteEquipmentImage);

// ── Timeline posts ────────────────────────────────────────────────────────────
router.get('/profile/posts', onlyProvider, getMyProviderPosts);
router.post('/profile/posts', onlyProvider, memoryUploader.array('images', 10), createProviderPost);
router.delete('/profile/posts/:postId', onlyProvider, deleteProviderPost);

// ── Image bytes — public, unauthenticated (same exposure as static /uploads) ──
router.get('/images/:imageId', getProviderImage);

// ── Public view (farmers/providers/admin) — keep last so /profile/* wins ───────
router.get('/:id', protect, authorize('farmer', 'provider', 'admin'), getProviderPublicProfile);

module.exports = router;
