const mongoose = require('mongoose');

/**
 * Notification model — system notifications for users.
 */
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['order', 'message', 'market', 'system', 'friend_request', 'service_request', 'wallet'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Notification body is required'],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedModel',
    },
    relatedModel: {
      type: String,
      enum: ['Product', 'Message', 'Post', 'User', 'Order', 'AdminAnnouncement', 'FarmServiceRequest', 'FarmServiceListing', 'WalletTransaction', 'RechargeRequest', 'DeliveryPartner'],
    },
  },
  { timestamps: true }
);

// Index for efficient queries: get notifications for a user, sorted by creation time
notificationSchema.index({ user: 1, createdAt: -1 });

// Index for unread count queries
notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
