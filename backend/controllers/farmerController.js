const User = require('../models/User');
const Product = require('../models/Product');
const Post = require('../models/Post');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * GET /api/farmers
 * Returns paginated list of farmers with optional search/filter.
 */
const getFarmers = async (req, res, next) => {
  try {
    const { search, location, page = 1, limit = 12 } = req.query;
    const filter = { role: 'farmer', isActive: true };

    if (location) {
      filter.farmLocation = { $regex: location, $options: 'i' };
    }
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { farmName: { $regex: search, $options: 'i' } },
        { cropTypes: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [farmers, total] = await Promise.all([
      User.find(filter)
        .select('fullName farmName farmLocation cropTypes avatar bio rating totalReviews isVerified createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ isVerified: -1, rating: -1, createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    return successResponse(res, 'Farmers list', {
      farmers,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/farmers/:id
 * Returns a farmer's public profile with their recent products and posts.
 */
const getFarmerById = async (req, res, next) => {
  try {
    const farmer = await User.findOne({ _id: req.params.id, role: 'farmer', isActive: true }).select(
      '-password'
    );

    if (!farmer) return errorResponse(res, 'Farmer not found', 404);

    const [products, posts] = await Promise.all([
      Product.find({ farmer: farmer._id, isAvailable: true }).sort({ createdAt: -1 }).limit(8),
      Post.find({ author: farmer._id, isPublished: true }).sort({ createdAt: -1 }).limit(6),
    ]);

    return successResponse(res, 'Farmer profile', { farmer, products, posts });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/farmers/profile
 * Updates the authenticated farmer's farm-specific profile fields.
 */
const updateFarmerProfile = async (req, res, next) => {
  try {
    if (req.user.role !== 'farmer') {
      return errorResponse(res, 'Only farmers can update a farmer profile', 403);
    }

    const allowedFields = [
      'farmName', 'farmLocation', 'farmSizeAcres', 'cropTypes', 'bio',
    ];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, 'Farmer profile updated', user);
  } catch (err) {
    next(err);
  }
};

module.exports = { getFarmers, getFarmerById, updateFarmerProfile };
