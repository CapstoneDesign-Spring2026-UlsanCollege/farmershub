const mongoose = require('mongoose');

const MAX_RECHARGE_WON = 500000;

/**
 * A user's request to top up their virtual wallet. An admin reviews each request
 * and approves (credits the wallet) or rejects it.
 */
const rechargeRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterName: { type: String, default: '', trim: true },
    requesterRole: { type: String, default: '', trim: true },
    amount: {
      // Korean won, positive integer, capped per request.
      type: Number,
      required: true,
      min: 1,
      max: MAX_RECHARGE_WON,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
    },
    note: { type: String, default: '', trim: true, maxlength: 300 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: '', trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

rechargeRequestSchema.index({ status: 1, createdAt: -1 });
rechargeRequestSchema.index({ requester: 1, createdAt: -1 });

module.exports = {
  RechargeRequest: mongoose.model('RechargeRequest', rechargeRequestSchema),
  MAX_RECHARGE_WON,
};
