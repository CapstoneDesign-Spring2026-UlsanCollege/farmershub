const mongoose = require('mongoose');

/**
 * Message model — direct messages between buyers and farmers.
 */
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    attachments: {
      type: [{
        url: { type: String, required: true },
        filename: { type: String, required: true },
        originalName: { type: String, required: true, maxlength: 255 },
        mimeType: { type: String, required: true, maxlength: 150 },
        size: { type: Number, required: true, min: 0, max: 5 * 1024 * 1024 },
      }],
      validate: {
        validator: (items) => items.length <= 5,
        message: 'A message can include at most 5 attachments',
      },
      default: [],
    },
    // Optional product reference (e.g. enquiry about a product)
    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    relatedServiceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmServiceRequest',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.pre('validate', function validateMessageBody(next) {
  if (!String(this.content || '').trim() && !this.attachments?.length) {
    this.invalidate('content', 'Message content or an attachment is required');
  }
  next();
});

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1, createdAt: -1 });
messageSchema.index({ relatedServiceRequest: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
