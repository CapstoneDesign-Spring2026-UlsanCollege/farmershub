const express = require('express');
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { uploader, withUploadFolder } = require('../middleware/upload');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', requireAuth, requireRole('farmer'), withUploadFolder('products'), uploader.single('images'), createProduct);
router.put('/:id', requireAuth, requireRole('farmer'), withUploadFolder('products'), uploader.single('images'), updateProduct);
router.delete('/:id', requireAuth, requireRole('farmer'), deleteProduct);

module.exports = router;