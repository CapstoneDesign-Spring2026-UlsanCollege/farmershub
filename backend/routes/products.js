const express = require('express');
const authRequired = require('../middleware/auth');

function createProductRouter(store) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const items = await store.listProducts(req.query || {});
      return res.json({ success: true, data: items });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
  });

  router.post('/', authRequired, async (req, res) => {
    try {
      if (req.user.role !== 'farmer') {
        return res.status(403).json({
          success: false,
          message: 'Only farmers can create products.'
        });
      }

      if (!req.body || !req.body.name) {
        return res.status(400).json({
          success: false,
          message: 'Product name is required.'
        });
      }

      const product = await store.createProduct(req.body, {
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role
      });

      return res.status(201).json({ success: true, data: product });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
  });

  router.put('/:id', authRequired, async (req, res) => {
    try {
      const result = await store.updateProduct(req.params.id, req.body || {}, req.user.id);
      if (result.error) {
        return res.status(result.error.status).json({ success: false, message: result.error.message });
      }

      return res.json({ success: true, data: result.product });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
  });

  router.delete('/:id', authRequired, async (req, res) => {
    try {
      const result = await store.deleteProduct(req.params.id, req.user.id);
      if (result.error) {
        return res.status(result.error.status).json({ success: false, message: result.error.message });
      }

      return res.json({ success: true, message: 'Product deleted successfully.' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
  });

  return router;
}

module.exports = createProductRouter;