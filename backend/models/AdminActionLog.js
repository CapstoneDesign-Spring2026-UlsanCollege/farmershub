const mongoose = require('mongoose');

const adminActionLogSchema = new mongoose.Schema(
  {
    admin: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      email: { type: String, default: '', trim: true, lowercase: true },
      name: { type: String, default: '', trim: true },
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    targetType: {
      type: String,
      default: '',
      trim: true,
    },
    targetId: {
      type: String,
      default: '',
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

adminActionLogSchema.index({ createdAt: -1 });
adminActionLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AdminActionLog', adminActionLogSchema);
