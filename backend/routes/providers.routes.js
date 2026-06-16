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
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploader, withUploadFolder } = require('../middleware/upload');

const onlyProvider = [protect, authorize('provider')];

router.get('/profile', onlyProvider, getProviderProfile);
router.put('/profile', onlyProvider, updateProviderProfile);

// ── Profile imagery ───────────────────────────────────────────────────────────
router.post('/profile/avatar', onlyProvider, withUploadFolder('providers'), uploader.single('avatar'), uploadProviderAvatar);
router.post('/profile/cover', onlyProvider, withUploadFolder('providers'), uploader.single('cover'), uploadProviderCover);

// ── Equipment gallery ─────────────────────────────────────────────────────────
router.post('/profile/equipment', onlyProvider, withUploadFolder('providers'), uploader.array('images', 10), addEquipmentImages);
router.delete('/profile/equipment/:imageId', onlyProvider, deleteEquipmentImage);

// ── Timeline posts ────────────────────────────────────────────────────────────
router.get('/profile/posts', onlyProvider, getMyProviderPosts);
router.post('/profile/posts', onlyProvider, withUploadFolder('providers'), uploader.array('images', 10), createProviderPost);
router.delete('/profile/posts/:postId', onlyProvider, deleteProviderPost);

// ── Public view (farmers/providers/admin) — keep last so /profile/* wins ───────
router.get('/:id', protect, authorize('farmer', 'provider', 'admin'), getProviderPublicProfile);

module.exports = router;
