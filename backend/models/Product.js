const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    brand: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    costPrice: {
      type: Number,
      default: 0,
      min: 0
    },
    sellingPrice: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    price: {
      type: Number,
      default: 0,
      min: 0
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    unit: {
      type: String,
      default: 'kg',
      trim: true
    },
    harvestDate: {
      type: String,
      default: ''
    },
    expiryDate: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    paymentMethods: {
      type: [String],
      default: []
    },
    seller: {
      id: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      fullName: {
        type: String,
        required: true
      },
      role: {
        type: String,
        required: true,
        enum: ['farmer', 'customer']
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);