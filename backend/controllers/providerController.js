const ProviderProfile = require('../models/ProviderProfile');
const { FarmServiceListing } = require('../models/FarmServiceListing');
const { successResponse, errorResponse } = require('../utils/apiResponse');

function asString(value, fallback = '') {
  return String(value ?? fallback).trim();
}

function asStringArray(value) {
  if (Array.isArray(value)) return value.map((item) => asString(item)).filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function userIdOf(user) {
  return user?._id || user?.id;
}

function serializeProviderProfile(profile, user, { publicOnly = false } = {}) {
  const base = {
    id: String(profile.userId),
    userId: String(profile.userId),
    fullName: user?.fullName || '',
    role: 'provider',
    businessName: profile.businessName,
    businessType: profile.businessType,
    serviceCategories: profile.serviceCategories,
    serviceArea: profile.serviceArea,
    location: profile.location,
    bio: profile.bio,
    website: profile.website,
    contactPreference: profile.contactPreference,
    operatingHours: profile.operatingHours,
    verificationStatus: profile.verificationStatus,
    isOnboarded: profile.isOnboarded,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };

  if (!publicOnly) {
    base.email = user?.email || '';
    base.phone = user?.phone || '';
    base.publicEmail = profile.publicEmail;
    base.publicPhone = profile.publicPhone;
  } else {
    base.publicEmail = profile.publicEmail;
    base.publicPhone = profile.publicPhone;
  }

  return base;
}

async function ensureProviderProfile(user) {
  const userId = userIdOf(user);
  let profile = await ProviderProfile.findOne({ userId });
  if (!profile) {
    profile = await ProviderProfile.create({
      userId,
      businessName: user.fullName ? `${user.fullName} Services` : 'Provider Services',
      location: user.address || '',
      publicPhone: user.phone || '',
      publicEmail: user.email || '',
    });
  }
  return profile;
}

function buildProfileUpdates(body = {}) {
  const updates = {};
  [
    'businessName',
    'businessType',
    'serviceArea',
    'location',
    'bio',
    'publicEmail',
    'publicPhone',
    'website',
    'contactPreference',
    'operatingHours',
  ].forEach((field) => {
    if (body[field] !== undefined) updates[field] = asString(body[field]);
  });

  if (body.serviceCategories !== undefined) {
    updates.serviceCategories = asStringArray(body.serviceCategories);
  }

  const businessName = updates.businessName;
  const serviceArea = updates.serviceArea;
  if (businessName || serviceArea || updates.serviceCategories?.length) {
    updates.isOnboarded = Boolean(
      asString(businessName || body.currentBusinessName || '') ||
      asString(serviceArea || body.currentServiceArea || '') ||
      updates.serviceCategories?.length
    );
  }

  return updates;
}

async function getProviderProfile(req, res, next) {
  try {
    const profile = await ensureProviderProfile(req.user);
    return successResponse(res, 'Provider profile', serializeProviderProfile(profile, req.user));
  } catch (err) {
    next(err);
  }
}

async function updateProviderProfile(req, res, next) {
  try {
    const profile = await ensureProviderProfile(req.user);
    const updates = buildProfileUpdates({
      ...req.body,
      currentBusinessName: profile.businessName,
      currentServiceArea: profile.serviceArea,
    });

    Object.assign(profile, updates);
    profile.isOnboarded = Boolean(profile.businessName && profile.serviceArea);
    await profile.save();

    return successResponse(res, 'Provider profile updated', serializeProviderProfile(profile, req.user));
  } catch (err) {
    next(err);
  }
}

async function getProviderPublicProfile(req, res, next) {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.params.id });
    if (!profile) {
      return errorResponse(res, 'Provider profile not found', 404);
    }

    const listings = await FarmServiceListing.find({
      'provider.userId': profile.userId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return successResponse(res, 'Provider public profile', {
      profile: serializeProviderProfile(profile, { fullName: profile.businessName }, { publicOnly: true }),
      listings: listings.map((listing) => ({
        id: String(listing._id),
        title: listing.title,
        category: listing.category,
        listingType: listing.listingType,
        pricingType: listing.pricingType,
        price: listing.price,
        unitLabel: listing.unitLabel,
        serviceArea: listing.serviceArea,
        availability: listing.availability,
        description: listing.description,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProviderProfile,
  updateProviderProfile,
  getProviderPublicProfile,
};
