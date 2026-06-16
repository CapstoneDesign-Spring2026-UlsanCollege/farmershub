const { DeliveryPartner, VEHICLE_TYPES } = require('../models/DeliveryPartner');
const { successResponse, errorResponse } = require('../utils/apiResponse');

function serialize(partner) {
  return {
    id: String(partner._id),
    provider: String(partner.provider),
    providerName: partner.providerName,
    name: partner.name,
    vehicleType: partner.vehicleType,
    coverageArea: partner.coverageArea,
    estimatedTime: partner.estimatedTime,
    fee: partner.fee,
    isActive: partner.isActive,
    createdAt: partner.createdAt,
  };
}

function readPayload(body) {
  const fee = Math.max(Math.round(Number(body.fee) || 0), 0);
  const vehicleType = VEHICLE_TYPES.includes(body.vehicleType) ? body.vehicleType : 'van';
  return {
    name: String(body.name || '').trim().slice(0, 120),
    vehicleType,
    coverageArea: String(body.coverageArea || '').trim().slice(0, 160),
    estimatedTime: String(body.estimatedTime || '').trim().slice(0, 80),
    fee,
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
  };
}

// GET /api/delivery-partners/mine — provider's own delivery options.
async function listMine(req, res, next) {
  try {
    const partners = await DeliveryPartner.find({ provider: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return successResponse(res, 'Delivery partners retrieved', {
      partners: partners.map(serialize),
      vehicleTypes: VEHICLE_TYPES,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/delivery-partners/available — active options for farmers to choose from.
async function listAvailable(req, res, next) {
  try {
    const partners = await DeliveryPartner.find({ isActive: true })
      .sort({ fee: 1, createdAt: -1 })
      .limit(100)
      .lean();
    return successResponse(res, 'Available delivery partners retrieved', {
      partners: partners.map(serialize),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/delivery-partners — provider creates a delivery option.
async function createPartner(req, res, next) {
  try {
    const payload = readPayload(req.body);
    if (!payload.name) {
      return errorResponse(res, 'Delivery partner name is required', 400);
    }
    const partner = await DeliveryPartner.create({
      provider: req.user._id,
      providerName: req.user.fullName || req.user.farmName || '',
      ...payload,
    });
    return successResponse(res, 'Delivery partner added', { partner: serialize(partner) }, 201);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/delivery-partners/:id — provider updates one of their options.
async function updatePartner(req, res, next) {
  try {
    const partner = await DeliveryPartner.findOne({ _id: req.params.id, provider: req.user._id });
    if (!partner) {
      return errorResponse(res, 'Delivery partner not found', 404);
    }
    const payload = readPayload({ ...serialize(partner), ...req.body });
    if (!payload.name) {
      return errorResponse(res, 'Delivery partner name is required', 400);
    }
    Object.assign(partner, payload);
    await partner.save();
    return successResponse(res, 'Delivery partner updated', { partner: serialize(partner) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/delivery-partners/:id — provider removes one of their options.
async function deletePartner(req, res, next) {
  try {
    const partner = await DeliveryPartner.findOneAndDelete({ _id: req.params.id, provider: req.user._id });
    if (!partner) {
      return errorResponse(res, 'Delivery partner not found', 404);
    }
    return successResponse(res, 'Delivery partner removed', { id: String(partner._id) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMine,
  listAvailable,
  createPartner,
  updatePartner,
  deletePartner,
  serialize,
};
