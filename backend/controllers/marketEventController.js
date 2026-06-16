const mongoose = require('mongoose');
const MarketEvent = require('../models/MarketEvent');
const { successResponse, errorResponse } = require('../utils/apiResponse');

function toApi(event) {
  return {
    id: String(event._id),
    title: event.title,
    location: event.location,
    startsAt: event.startsAt,
    endsAt: event.endsAt || null,
    description: event.description || '',
    createdAt: event.createdAt,
  };
}

// GET /api/market-events — public; upcoming events first, soonest at the top.
const listMarketEvents = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const includePast = String(req.query.includePast || '') === 'true';
    const query = includePast ? {} : { startsAt: { $gte: new Date() } };
    const events = await MarketEvent.find(query)
      .sort({ startsAt: includePast ? -1 : 1 })
      .limit(limit)
      .lean();
    return successResponse(res, 'Market events', events.map(toApi));
  } catch (err) {
    next(err);
  }
};

// POST /api/market-events — admin only.
const createMarketEvent = async (req, res, next) => {
  try {
    const title = String(req.body.title || '').trim();
    const location = String(req.body.location || '').trim();
    if (!title || !location || !req.body.startsAt) {
      return errorResponse(res, 'Title, location and start date are required', 400);
    }

    const startsAt = new Date(req.body.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      return errorResponse(res, 'Start date is invalid', 400);
    }

    let endsAt = null;
    if (req.body.endsAt) {
      const parsed = new Date(req.body.endsAt);
      if (Number.isNaN(parsed.getTime())) {
        return errorResponse(res, 'End date is invalid', 400);
      }
      endsAt = parsed;
    }

    const event = await MarketEvent.create({
      title,
      location,
      startsAt,
      endsAt,
      description: String(req.body.description || '').trim(),
      createdBy: req.user?._id || null,
    });
    return successResponse(res, 'Market event created', toApi(event), 201);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/market-events/:id — admin only.
const deleteMarketEvent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return errorResponse(res, 'Invalid event id', 400);
    }
    const event = await MarketEvent.findByIdAndDelete(req.params.id);
    if (!event) return errorResponse(res, 'Market event not found', 404);
    return successResponse(res, 'Market event deleted', null);
  } catch (err) {
    next(err);
  }
};

module.exports = { listMarketEvents, createMarketEvent, deleteMarketEvent };
