const User = require('../models/User');
const path = require('path');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * GET /api/users/profile
 * Returns the authenticated user's profile.
 */
const getProfile = async (req, res) => {
  return successResponse(res, 'User profile', req.user);
};

/**
 * PUT /api/users/profile
 * Updates the authenticated user's profile (non-sensitive fields).
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['fullName', 'phone', 'address', 'bio', 'paymentMethod'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, 'Profile updated', user);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/users/avatar
 * Uploads a profile picture for the authenticated user.
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'avatar.url': avatarUrl, 'avatar.publicId': req.file.filename },
      { new: true }
    );

    return successResponse(res, 'Avatar updated', { avatar: user.avatar });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users  (admin only)
 * Returns all users with optional role filter.
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    return successResponse(res, 'Users list', {
      users,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/:id  (admin only)
 * Deactivates a user account (soft delete).
 */
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) return errorResponse(res, 'User not found', 404);

    return successResponse(res, 'User deactivated', null);
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar, getAllUsers, deactivateUser };
