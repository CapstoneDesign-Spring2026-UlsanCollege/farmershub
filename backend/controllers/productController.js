const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * POST /api/products
 * Creates a new product listing. Farmer role only.
 */
const createProduct = async (req, res, next) => {
  try {
    const { title, description, category, price, unit, quantityAvailable, location, tags } = req.body;

    const images = req.files
      ? req.files.map((f) => ({ url: `/uploads/${f.filename}`, publicId: f.filename }))
      : [];

    const product = await Product.create({
      farmer: req.user._id,
      title, description, category, price, unit, quantityAvailable, location,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
      images,
    });

    return successResponse(res, 'Product created', product, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products
 * Returns paginated product listings with optional filters.
 */
const getProducts = async (req, res, next) => {
  try {
    const { category, search, farmerId, minPrice, maxPrice, page = 1, limit = 16 } = req.query;
    const filter = { isAvailable: true };

    if (category) filter.category = category;
    if (farmerId) filter.farmer = farmerId;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('farmer', 'fullName farmName avatar farmLocation isVerified')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    return successResponse(res, 'Products list', {
      products,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/:id
 * Returns a single product with farmer details. Increments view count.
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('farmer', 'fullName farmName avatar farmLocation isVerified phone');

    if (!product) return errorResponse(res, 'Product not found', 404);

    return successResponse(res, 'Product details', product);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/products/:id
 * Updates a product. Only the owning farmer may update.
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 'Product not found', 404);

    if (product.farmer.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to update this product', 403);
    }

    const allowedFields = ['title', 'description', 'category', 'price', 'unit', 'quantityAvailable', 'location', 'tags', 'isAvailable'];
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });

    await product.save();
    return successResponse(res, 'Product updated', product);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/products/:id
 * Deletes a product. Only the owning farmer or an admin may delete.
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 'Product not found', 404);

    const isOwner = product.farmer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return errorResponse(res, 'Not authorized to delete this product', 403);
    }

    await product.deleteOne();
    return successResponse(res, 'Product deleted', null);
  } catch (err) {
    next(err);
  }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
