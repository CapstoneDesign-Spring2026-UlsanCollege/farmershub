const { FarmServiceListing } = require('../models/FarmServiceListing');
const { FarmServiceRequest } = require('../models/FarmServiceRequest');
const { createNotification } = require('./notificationController');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const walletService = require('../services/walletService');

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

function asDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isParticipant(request, user) {
  const id = userIdOf(user);
  return String(request.farmer.userId) === id || String(request.provider.userId) === id;
}

function serializeRequest(request) {
  const listing = request.listing && request.listing.title ? {
    id: String(request.listing._id),
    title: request.listing.title,
    category: request.listing.category,
    listingType: request.listing.listingType,
    pricingType: request.listing.pricingType,
    price: request.listing.price,
  } : String(request.listing);

  return {
    id: String(request._id),
    listing,
    provider: {
      id: String(request.provider.userId),
      name: request.provider.name,
      businessName: request.provider.businessName,
    },
    farmer: {
      id: String(request.farmer.userId),
      name: request.farmer.name,
      phone: request.farmer.phone,
      location: request.farmer.location,
    },
    status: request.status,
    farmLocation: request.farmLocation,
    needDescription: request.needDescription,
    preferredStartDate: request.preferredStartDate,
    preferredEndDate: request.preferredEndDate,
    acreageOrQuantity: request.acreageOrQuantity,
    budget: request.budget,
    contactPreference: request.contactPreference,
    notes: request.notes,
    quote: request.quote,
    declineReason: request.declineReason,
    completedAt: request.completedAt,
    cancelledAt: request.cancelledAt,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

async function notify(userId, title, body, requestId) {
  await createNotification(userId, 'service_request', title, body, requestId, 'FarmServiceRequest');
}

async function listServiceRequests(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNumber - 1) * pageSize;
    const query = {};

    if (req.user.role === 'farmer') {
      query['farmer.userId'] = req.user._id;
    } else if (req.user.role === 'provider') {
      query['provider.userId'] = req.user._id;
    }

    if (status) query.status = status;

    const [requests, total] = await Promise.all([
      FarmServiceRequest.find(query)
        .populate('listing', 'title category listingType pricingType price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      FarmServiceRequest.countDocuments(query),
    ]);

    return successResponse(res, 'Service requests', {
      requests: requests.map(serializeRequest),
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

async function getOwnedRequest(req, res) {
  const request = await FarmServiceRequest.findById(req.params.id)
    .populate('listing', 'title category listingType pricingType price');
  if (!request) {
    return { error: errorResponse(res, 'Service request not found', 404) };
  }

  if (req.user.role !== 'admin' && !isParticipant(request, req.user)) {
    return { error: errorResponse(res, 'You can only access your own service requests', 403) };
  }

  return { request };
}

async function getServiceRequestById(req, res, next) {
  try {
    const { request, error } = await getOwnedRequest(req, res);
    if (error) return error;
    return successResponse(res, 'Service request', serializeRequest(request));
  } catch (err) {
    next(err);
  }
}

async function createServiceRequest(req, res, next) {
  try {
    const listing = await FarmServiceListing.findOne({ _id: req.body.listingId, isActive: true });
    if (!listing) {
      return errorResponse(res, 'Active service listing not found', 404);
    }

    const farmLocation = asString(req.body.farmLocation || req.body.serviceLocation);
    const needDescription = asString(req.body.needDescription || req.body.description);
    if (!farmLocation || !needDescription) {
      return errorResponse(res, 'Farm location and description of need are required', 400);
    }

    const request = await FarmServiceRequest.create({
      listing: listing._id,
      provider: listing.provider,
      farmer: {
        userId: req.user._id,
        name: req.user.fullName,
        phone: req.user.phone || '',
        location: req.user.address || '',
      },
      farmLocation,
      needDescription,
      preferredStartDate: asDate(req.body.preferredStartDate),
      preferredEndDate: asDate(req.body.preferredEndDate),
      acreageOrQuantity: asString(req.body.acreageOrQuantity),
      budget: asNumber(req.body.budget, 0),
      contactPreference: asString(req.body.contactPreference, 'message'),
      notes: asString(req.body.notes),
    });

    await request.populate('listing', 'title category listingType pricingType price');
    await notify(
      request.provider.userId,
      'New farm service request',
      `${request.farmer.name} requested ${listing.title}.`,
      request._id
    );

    return successResponse(res, 'Service request submitted', serializeRequest(request), 201);
  } catch (err) {
    next(err);
  }
}

async function quoteServiceRequest(req, res, next) {
  try {
    const { request, error } = await getOwnedRequest(req, res);
    if (error) return error;
    if (req.user.role !== 'provider' || String(request.provider.userId) !== userIdOf(req.user)) {
      return errorResponse(res, 'Only the receiving provider can quote this request', 403);
    }
    if (!['new', 'quoted'].includes(request.status)) {
      return errorResponse(res, 'Only new or quoted requests can be quoted', 400);
    }

    const amount = asNumber(req.body.amount, 0);
    if (amount <= 0) {
      return errorResponse(res, 'Quoted amount must be greater than zero', 400);
    }

    request.status = 'quoted';
    request.quote = {
      amount,
      pricingType: asString(req.body.pricingType, 'fixed'),
      notes: asString(req.body.notes),
      validUntil: asDate(req.body.validUntil),
      quotedAt: new Date(),
    };
    request.declineReason = '';
    await request.save();
    await request.populate('listing', 'title category listingType pricingType price');
    await notify(
      request.farmer.userId,
      'Service request quoted',
      `${request.provider.businessName} sent a quotation for ${request.listing.title}.`,
      request._id
    );

    return successResponse(res, 'Service request quoted', serializeRequest(request));
  } catch (err) {
    next(err);
  }
}

async function declineServiceRequest(req, res, next) {
  try {
    const { request, error } = await getOwnedRequest(req, res);
    if (error) return error;
    if (req.user.role !== 'provider' || String(request.provider.userId) !== userIdOf(req.user)) {
      return errorResponse(res, 'Only the receiving provider can decline this request', 403);
    }
    if (!['new', 'quoted'].includes(request.status)) {
      return errorResponse(res, 'Only new or quoted requests can be declined', 400);
    }

    request.status = 'declined';
    request.declineReason = asString(req.body.reason || req.body.notes);
    await request.save();
    await request.populate('listing', 'title category listingType pricingType price');
    await notify(
      request.farmer.userId,
      'Service request declined',
      `${request.provider.businessName} declined the request for ${request.listing.title}.`,
      request._id
    );

    return successResponse(res, 'Service request declined', serializeRequest(request));
  } catch (err) {
    next(err);
  }
}

async function acceptServiceRequestQuote(req, res, next) {
  try {
    const { request, error } = await getOwnedRequest(req, res);
    if (error) return error;
    if (req.user.role !== 'farmer' || String(request.farmer.userId) !== userIdOf(req.user)) {
      return errorResponse(res, 'Only the requesting farmer can accept this quote', 403);
    }
    if (request.status !== 'quoted') {
      return errorResponse(res, 'Only quoted requests can be accepted', 400);
    }

    const quotedAmount = asNumber(request.quote && request.quote.amount, 0);
    if (quotedAmount <= 0) {
      return errorResponse(res, 'This request has no valid quoted amount to accept', 400);
    }

    // Accepting the quote is the purchase: move the quoted amount from the
    // farmer to the provider before marking the request accepted, mirroring how
    // orders and delivery fees are charged on commit. If the transfer fails
    // (e.g. insufficient funds) the request stays 'quoted' so it can be retried.
    await walletService.transfer(req.user._id, request.provider.userId, quotedAmount, {
      type: 'service_payment',
      debitDescription: `Service — ${request.provider.businessName || 'provider'} (request ${request._id})`,
      creditDescription: `Service — ${request.farmer.name || 'farmer'} (request ${request._id})`,
      fromCounterparty: walletService.counterpartyFrom(req.user),
      toCounterparty: { userId: request.provider.userId, name: request.provider.businessName || request.provider.name, role: 'provider' },
      relatedId: request._id,
      relatedModel: 'FarmServiceRequest',
      insufficientMessage: 'Your wallet balance is too low to accept this quote. Recharge your wallet and try again.',
    });

    request.status = 'accepted';
    await request.save();
    await request.populate('listing', 'title category listingType pricingType price');
    await notify(
      request.provider.userId,
      'Service quote accepted',
      `${request.farmer.name} accepted and paid your quote for ${request.listing.title}.`,
      request._id
    );

    return successResponse(res, 'Service quote accepted', serializeRequest(request));
  } catch (err) {
    next(err);
  }
}

async function cancelServiceRequest(req, res, next) {
  try {
    const { request, error } = await getOwnedRequest(req, res);
    if (error) return error;
    if (req.user.role !== 'farmer' || String(request.farmer.userId) !== userIdOf(req.user)) {
      return errorResponse(res, 'Only the requesting farmer can cancel this request', 403);
    }
    if (!['new', 'quoted', 'accepted'].includes(request.status)) {
      return errorResponse(res, 'This request cannot be cancelled in its current state', 400);
    }

    request.status = 'cancelled';
    request.cancelledAt = new Date();
    await request.save();
    await request.populate('listing', 'title category listingType pricingType price');
    await notify(
      request.provider.userId,
      'Service request cancelled',
      `${request.farmer.name} cancelled the request for ${request.listing.title}.`,
      request._id
    );

    return successResponse(res, 'Service request cancelled', serializeRequest(request));
  } catch (err) {
    next(err);
  }
}

async function completeServiceRequest(req, res, next) {
  try {
    const { request, error } = await getOwnedRequest(req, res);
    if (error) return error;
    if (req.user.role !== 'provider' || String(request.provider.userId) !== userIdOf(req.user)) {
      return errorResponse(res, 'Only the assigned provider can complete this request', 403);
    }
    if (request.status !== 'accepted') {
      return errorResponse(res, 'Only accepted requests can be completed', 400);
    }

    request.status = 'completed';
    request.completedAt = new Date();
    await request.save();
    await request.populate('listing', 'title category listingType pricingType price');
    await notify(
      request.farmer.userId,
      'Service request completed',
      `${request.provider.businessName} marked the service request complete.`,
      request._id
    );

    return successResponse(res, 'Service request completed', serializeRequest(request));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listServiceRequests,
  getServiceRequestById,
  createServiceRequest,
  quoteServiceRequest,
  declineServiceRequest,
  acceptServiceRequestQuote,
  cancelServiceRequest,
  completeServiceRequest,
};
