const mongoose = require('mongoose');

/**
 * A local market / farmers' market event surfaced in the community feed widgets.
 * Created and managed by admins; read publicly so the feed can list upcoming dates.
 */
const marketEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 140,
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
      maxlength: 180,
    },
    startsAt: {
      type: Date,
      required: [true, 'Event start date is required'],
    },
    endsAt: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

marketEventSchema.index({ startsAt: 1 });

module.exports = mongoose.model('MarketEvent', marketEventSchema);
