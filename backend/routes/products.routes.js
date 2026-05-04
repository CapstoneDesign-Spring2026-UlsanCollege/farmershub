const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { createProductRules } = require('../middleware/validate');

// GET  /api/products         — public product listing
router.get('/', getProducts);

// GET  /api/products/:id     — single product detail
router.get('/:id', getProductById);

// POST /api/products         — create product (farmer only)
router.post(
  '/',
  protect,
  authorize('farmer'),
  upload.array('images', 6),
  createProductRules,
  createProduct
);

// PUT  /api/products/:id     — update product (farmer only, owner check in controller)
router.put('/:id', protect, authorize('farmer'), updateProduct);

// DELETE /api/products/:id   — delete product (farmer or admin)
router.delete('/:id', protect, authorize('farmer', 'admin'), deleteProduct);

module.exports = router;
