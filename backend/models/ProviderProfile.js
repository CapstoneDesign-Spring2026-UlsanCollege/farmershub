const mongoose = require('mongoose');

const providerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: 120,
    },
    businessType: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    serviceCategories: {
      type: [String],
      default: [],
    },
    serviceArea: {
      type: String,
      default: '',
      trim: true,
      maxlength: 180,
    },
    location: {
      type: String,
      default: '',
      trim: true,
      maxlength: 180,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1200,
    },
    publicEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    publicPhone: {
      type: String,
      default: '',
      trim: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    contactPreference: {
      type: String,
      enum: ['message', 'phone', 'email', 'message_or_phone', ''],
      default: 'message',
    },
    operatingHours: {
      type: String,
      default: '',
      trim: true,
      maxlength: 240,
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

providerProfileSchema.index({ businessName: 'text', serviceArea: 'text', location: 'text', bio: 'text' });
providerProfileSchema.index({ serviceCategories: 1, updatedAt: -1 });

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
