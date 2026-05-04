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
const { uploader, withUploadFolder } = require('../middleware/upload');

// GET  /api/products         — public product listing
router.get('/', getProducts);

// GET  /api/products/:id     — single product detail
router.get('/:id', getProductById);

// POST /api/products         — create product (farmer only)
router.post(
  '/',
  protect,
  authorize('farmer'),
  withUploadFolder('products'),
  uploader.single('images'),
  createProduct
);

// PUT  /api/products/:id     — update product (farmer only, owner check in controller)
router.put('/:id', protect, authorize('farmer'), withUploadFolder('products'), uploader.single('images'), updateProduct);

// DELETE /api/products/:id   — delete product (farmer or admin)
router.delete('/:id', protect, authorize('farmer', 'admin'), deleteProduct);

module.exports = router;
