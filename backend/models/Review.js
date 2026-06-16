const mongoose = require('mongoose');

/**
 * A customer review of a product they purchased.
 * One review per (product, customer); also rolls up into the seller's rating.
 */
const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customer: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: { type: String, required: true, trim: true },
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ seller: 1, createdAt: -1 });
// One review per customer per product.
reviewSchema.index({ product: 1, 'customer.userId': 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
