const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  placeOrder,
} = require('../controllers/productController');
const { listProductReviews, createProductReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploader, withUploadFolder } = require('../middleware/upload');
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
  withUploadFolder('products'),
  uploader.single('images'),
  ...createProductRules,
  createProduct
);

// PUT  /api/products/:id     — update product (farmer only, owner check in controller)
router.put('/:id', protect, authorize('farmer'), withUploadFolder('products'), uploader.single('images'), updateProduct);

// DELETE /api/products/:id   — delete product (farmer or admin)
router.delete('/:id', protect, authorize('farmer', 'admin'), deleteProduct);

// POST /api/products/:id/order — place order for product (customer only)
router.post('/:id/order', protect, authorize('customer'), placeOrder);

// GET  /api/products/:id/reviews — public product reviews + rating summary
router.get('/:id/reviews', listProductReviews);

// POST /api/products/:id/reviews — customer who ordered the product
router.post('/:id/reviews', protect, authorize('customer'), createProductReview);

module.exports = router;
