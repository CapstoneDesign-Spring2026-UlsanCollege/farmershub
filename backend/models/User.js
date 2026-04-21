const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Unified User model.
 * Roles: 'buyer' | 'farmer' | 'admin'
 * Farmer-specific fields are only relevant when role === 'farmer'.
 */
const userSchema = new mongoose.Schema(
  {
    // ── Core auth fields ──────────────────────────────────────────────────────
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ['buyer', 'farmer', 'admin'],
      default: 'buyer',
    },

    // ── Shared profile fields ─────────────────────────────────────────────────
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Farmer-specific fields (only populated when role === 'farmer') ─────────
    farmName: { type: String, trim: true },
    farmLocation: { type: String, trim: true },
    farmSizeAcres: { type: Number },
    cropTypes: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },

    // ── Payment info ──────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'mobile_pay', ''],
      default: '',
    },
  },
  { timestamps: true }
);

// ── Hash password before saving ───────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare submitted password against hash ──────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Remove sensitive fields from JSON output ──────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
