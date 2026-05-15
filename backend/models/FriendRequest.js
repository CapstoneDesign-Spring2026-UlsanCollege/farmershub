const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'cancelled'],
      default: 'pending',
      required: true,
    },
    notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification',
      default: null,
    },
  },
  { timestamps: true }
);

friendRequestSchema.index(
  { requester: 1, recipient: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
  }
);
friendRequestSchema.index({ recipient: 1, status: 1, createdAt: -1 });
friendRequestSchema.index({ requester: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('FriendRequest', friendRequestSchema);
