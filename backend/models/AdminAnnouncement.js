const mongoose = require('mongoose');

const adminAnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
    audience: {
      type: String,
      enum: ['all', 'farmer', 'customer', 'provider'],
      default: 'all',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

adminAnnouncementSchema.index({ audience: 1, createdAt: -1 });
adminAnnouncementSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('AdminAnnouncement', adminAnnouncementSchema);
