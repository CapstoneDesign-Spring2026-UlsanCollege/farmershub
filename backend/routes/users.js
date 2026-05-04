const express = require('express');
const authRequired = require('../middleware/auth');

function createUserRouter(store) {
  const router = express.Router();

  router.get('/farmers', async (req, res) => {
    try {
      const farmers = await store.listUsers('farmer');
      return res.json({ success: true, data: farmers });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
  });

  router.get('/customers', async (req, res) => {
    try {
      const customers = await store.listUsers('customer');
      return res.json({ success: true, data: customers });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
  });

  router.get('/me', authRequired, async (req, res) => {
    try {
      const me = await store.getUserById(req.user.role, req.user.id);
      if (!me) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      return res.json({ success: true, data: me });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
  });

  return router;
}

module.exports = createUserRouter;