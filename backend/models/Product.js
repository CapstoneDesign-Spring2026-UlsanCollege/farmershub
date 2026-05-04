const mongoose = require('mongoose');

/**
 * Product model — represents a crop/item listed by a farmer.
 */
const productSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Poultry', 'Herbs', 'Organic', 'Bulk Supply', 'Farm Tools', 'Seedlings', 'Other'],
      default: 'Other',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    unit: {
      type: String,
      default: 'kg', // kg, piece, bunch, litre, etc.
    },
    quantityAvailable: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: [
      {
        url: { type: String },
        publicId: { type: String }, // cloud storage reference
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      trim: true,
    },
    tags: [{ type: String }],
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for search and filtering
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isAvailable: 1 });

module.exports = mongoose.model('Product', productSchema);
