const express = require('express');
const router = express.Router();
const {
  getOverview,
  listUsers,
  getUserDetails,
  deleteUser,
  listProducts,
  deleteProduct,
  listUploads,
  deleteUpload,
  listOrders,
  updateOrder,
  deleteOrder,
  listMessages,
  deleteMessage,
  deleteConversation,
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getSettings,
  updateSettings,
  listLogs,
  createBackup,
  assistantQuery,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireConfiguredAdmin } = require('../middleware/adminOnly');

router.use(protect, requireConfiguredAdmin);

router.get('/overview', getOverview);

router.get('/users', listUsers);
router.get('/users/:id', getUserDetails);
router.delete('/users/:id', deleteUser);

router.get('/products', listProducts);
router.delete('/products/:id', deleteProduct);

router.get('/uploads', listUploads);
router.delete('/uploads', deleteUpload);

router.get('/orders', listOrders);
router.patch('/orders/:id', updateOrder);
router.delete('/orders/:id', deleteOrder);

router.get('/messages', listMessages);
router.delete('/messages/conversation/:userA/:userB', deleteConversation);
router.delete('/messages/:id', deleteMessage);

router.get('/announcements', listAnnouncements);
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

router.get('/logs', listLogs);
router.post('/backup', createBackup);
router.post('/assistant', assistantQuery);

module.exports = router;
