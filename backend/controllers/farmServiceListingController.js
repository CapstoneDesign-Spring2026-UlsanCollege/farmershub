const ProviderProfile = require('../models/ProviderProfile');
const {
  FarmServiceListing,
  SERVICE_CATEGORIES,
  LISTING_TYPES,
  PRICING_TYPES,
} = require('../models/FarmServiceListing');
const { successResponse, errorResponse } = require('../utils/apiResponse');

function userIdOf(user) {
  return String(user?._id || user?.id || '');
}

function asString(value, fallback = '') {
  return String(value ?? fallback).trim();
}

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function serializeListing(listing) {
  return {
    id: String(listing._id),
    provider: {
      id: String(listing.provider.userId),
      name: listing.provider.name,
      businessName: listing.provider.businessName,
      serviceArea: listing.provider.serviceArea,
    },
    title: listing.title,
    category: listing.category,
    listingType: listing.listingType,
    pricingType: listing.pricingType,
    price: listing.price,
    unitLabel: listing.unitLabel,
    serviceArea: listing.serviceArea,
    availability: listing.availability,
    description: listing.description,
    equipmentDetails: listing.equipmentDetails,
    termsSummary: listing.termsSummary,
    isActive: listing.isActive,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}

async function getProviderProfileForListing(req) {
  const profile = await ProviderProfile.findOne({ userId: req.user._id });
  if (!profile || !profile.isOnboarded) {
    return null;
  }
  return profile;
}

function buildListingPayload(body = {}, providerProfile = null, user = null, existing = null) {
  const pricingType = asString(body.pricingType, existing?.pricingType || 'quote_required');
  const price = asNumber(body.price, existing?.price || 0);
  const providerName = user?.fullName || existing?.provider?.name || '';
  const businessName = providerProfile?.businessName || existing?.provider?.businessName || providerName;
  const profileArea = providerProfile?.serviceArea || providerProfile?.location || '';

  return {
    provider: {
      userId: existing?.provider?.userId || user?._id,
      name: providerName,
      businessName,
      serviceArea: providerProfile?.serviceArea || existing?.provider?.serviceArea || '',
    },
    title: asString(body.title, existing?.title || ''),
    category: asString(body.category, existing?.category || ''),
    listingType: asString(body.listingType, existing?.listingType || ''),
    pricingType,
    price,
    unitLabel: asString(body.unitLabel, existing?.unitLabel || ''),
    serviceArea: asString(body.serviceArea, existing?.serviceArea || profileArea),
    availability: asString(body.availability, existing?.availability || ''),
    description: asString(body.description, existing?.description || ''),
    equipmentDetails: asString(body.equipmentDetails, existing?.equipmentDetails || ''),
    termsSummary: asString(body.termsSummary, existing?.termsSummary || ''),
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing?.isActive ?? true,
  };
}

function validateListingPayload(payload) {
  if (!payload.title) return 'Listing title is required.';
  if (!SERVICE_CATEGORIES.includes(payload.category)) return 'A valid service category is required.';
  if (!LISTING_TYPES.includes(payload.listingType)) return 'A valid listing type is required.';
  if (!PRICING_TYPES.includes(payload.pricingType)) return 'A valid pricing type is required.';
  if (payload.pricingType !== 'quote_required' && payload.price <= 0) {
    return 'Price is required unless the listing is quote-required.';
  }
  if (!payload.serviceArea) return 'Service area is required.';
  if (!payload.description) return 'Description is required.';
  return '';
}

async function listFarmServiceListings(req, res, next) {
  try {
    const { category, search, providerId, mine, status, page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNumber - 1) * pageSize;
    const query = {};

    if (category) query.category = asString(category);
    if (providerId) query['provider.userId'] = providerId;
    if (search) {
      const pattern = { $regex: asString(search), $options: 'i' };
      query.$or = [
        { title: pattern },
        { description: pattern },
        { serviceArea: pattern },
        { 'provider.businessName': pattern },
      ];
    }

    if (req.user.role === 'provider' && mine === 'true') {
      query['provider.userId'] = req.user._id;
      if (status === 'active') query.isActive = true;
      if (status === 'inactive') query.isActive = false;
    } else if (req.user.role !== 'admin') {
      query.isActive = true;
    } else if (status === 'active' || status === 'inactive') {
      query.isActive = status === 'active';
    }

    const [listings, total] = await Promise.all([
      FarmServiceListing.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      FarmServiceListing.countDocuments(query),
    ]);

    return successResponse(res, 'Farm service listings', {
      listings: listings.map(serializeListing),
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getFarmServiceListingById(req, res, next) {
  try {
    const listing = await FarmServiceListing.findById(req.params.id);
    if (!listing) {
      return errorResponse(res, 'Farm service listing not found', 404);
    }

    const isOwner = String(listing.provider.userId) === userIdOf(req.user);
    if (!listing.isActive && req.user.role !== 'admin' && !isOwner) {
      return errorResponse(res, 'Farm service listing not found', 404);
    }

    return successResponse(res, 'Farm service listing', serializeListing(listing));
  } catch (err) {
    next(err);
  }
}

async function createFarmServiceListing(req, res, next) {
  try {
    const providerProfile = await getProviderProfileForListing(req);
    if (!providerProfile) {
      return errorResponse(res, 'Complete provider onboarding before creating service listings', 400);
    }

    const payload = buildListingPayload(req.body, providerProfile, req.user);
    const validationMessage = validateListingPayload(payload);
    if (validationMessage) {
      return errorResponse(res, validationMessage, 400);
    }

    const listing = await FarmServiceListing.create(payload);
    return successResponse(res, 'Farm service listing created', serializeListing(listing), 201);
  } catch (err) {
    next(err);
  }
}

async function updateFarmServiceListing(req, res, next) {
  try {
    const listing = await FarmServiceListing.findById(req.params.id);
    if (!listing) {
      return errorResponse(res, 'Farm service listing not found', 404);
    }

    const isOwner = String(listing.provider.userId) === userIdOf(req.user);
    if (req.user.role !== 'admin' && !isOwner) {
      return errorResponse(res, 'You can only update your own service listings', 403);
    }

    const providerProfile = req.user.role === 'provider' ? await getProviderProfileForListing(req) : null;
    const payload = buildListingPayload(req.body, providerProfile, req.user, listing);
    const validationMessage = validateListingPayload(payload);
    if (validationMessage) {
      return errorResponse(res, validationMessage, 400);
    }

    Object.assign(listing, payload);
    await listing.save();

    return successResponse(res, 'Farm service listing updated', serializeListing(listing));
  } catch (err) {
    next(err);
  }
}

async function setListingActiveState(req, res, next) {
  try {
    const listing = await FarmServiceListing.findById(req.params.id);
    if (!listing) {
      return errorResponse(res, 'Farm service listing not found', 404);
    }

    const isOwner = String(listing.provider.userId) === userIdOf(req.user);
    if (req.user.role !== 'admin' && !isOwner) {
      return errorResponse(res, 'You can only manage your own service listings', 403);
    }

    listing.isActive = req.params.state === 'activate';
    await listing.save();

    return successResponse(
      res,
      listing.isActive ? 'Farm service listing activated' : 'Farm service listing deactivated',
      serializeListing(listing)
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listFarmServiceListings,
  getFarmServiceListingById,
  createFarmServiceListing,
  updateFarmServiceListing,
  setListingActiveState,
};
