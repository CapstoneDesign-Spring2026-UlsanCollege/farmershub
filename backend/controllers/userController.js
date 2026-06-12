const User = require('../models/User');
const path = require('path');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const ADDRESS_FIELDS = [
  'label',
  'fullName',
  'phone',
  'addressLine1',
  'addressLine2',
  'city',
  'region',
  'postalCode',
  'country',
];

function buildAddress(body = {}, existing = {}) {
  const address = {};
  ADDRESS_FIELDS.forEach((field) => {
    address[field] = body[field] === undefined
      ? String(existing[field] || '').trim()
      : String(body[field] || '').trim();
  });
  address.country = address.country || 'Nepal';
  address.isDefault = body.isDefault === undefined
    ? Boolean(existing.isDefault)
    : body.isDefault === true || body.isDefault === 'true';
  return address;
}

function validateAddress(address) {
  if (!address.addressLine1) return 'Address line 1 is required';
  if (!address.city) return 'City is required';
  return '';
}

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

const getMyAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return successResponse(res, 'Address book retrieved', user.addressBook || []);
  } catch (err) {
    next(err);
  }
};

const createMyAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = buildAddress(req.body);
    const validationError = validateAddress(address);
    if (validationError) return errorResponse(res, validationError, 400);

    if (!user.addressBook.length || address.isDefault) {
      user.addressBook.forEach((item) => { item.isDefault = false; });
      address.isDefault = true;
    }
    user.addressBook.push(address);
    await user.save();
    return successResponse(res, 'Address added', user.addressBook, 201);
  } catch (err) {
    next(err);
  }
};

const updateMyAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const current = user.addressBook.id(req.params.addressId);
    if (!current) return errorResponse(res, 'Address not found', 404);

    const address = buildAddress(req.body, current);
    const validationError = validateAddress(address);
    if (validationError) return errorResponse(res, validationError, 400);

    if (address.isDefault) {
      user.addressBook.forEach((item) => { item.isDefault = false; });
    }
    Object.assign(current, address);
    await user.save();
    return successResponse(res, 'Address updated', user.addressBook);
  } catch (err) {
    next(err);
  }
};

const deleteMyAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addressBook.id(req.params.addressId);
    if (!address) return errorResponse(res, 'Address not found', 404);

    const wasDefault = address.isDefault;
    address.deleteOne();
    if (wasDefault && user.addressBook.length) user.addressBook[0].isDefault = true;
    await user.save();
    return successResponse(res, 'Address deleted', user.addressBook);
  } catch (err) {
    next(err);
  }
};

const setDefaultMyAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addressBook.id(req.params.addressId);
    if (!address) return errorResponse(res, 'Address not found', 404);

    user.addressBook.forEach((item) => { item.isDefault = String(item._id) === String(address._id); });
    await user.save();
    return successResponse(res, 'Default address updated', user.addressBook);
  } catch (err) {
    next(err);
  }
};

const changeMyPassword = async (req, res, next) => {
  try {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');
    const confirmPassword = req.body.confirmPassword === undefined ? newPassword : String(req.body.confirmPassword);

    if (!currentPassword) return errorResponse(res, 'Current password is required', 400);
    if (newPassword.length < 6) return errorResponse(res, 'New password must be at least 6 characters', 400);
    if (newPassword !== confirmPassword) return errorResponse(res, 'New password confirmation does not match', 400);

    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();
    return successResponse(res, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

const deactivateMyAccount = async (req, res, next) => {
  try {
    if (String(req.body.confirmation || '') !== 'DELETE') {
      return errorResponse(res, 'Type DELETE to confirm account deletion', 400);
    }

    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    return successResponse(res, 'Account deactivated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  getAllUsers,
  deactivateUser,
  getMyAddresses,
  createMyAddress,
  updateMyAddress,
  deleteMyAddress,
  setDefaultMyAddress,
  changeMyPassword,
  deactivateMyAccount,
};
