const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
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
      select: false,
    },
    role: {
      type: String,
      enum: ['farmer', 'customer', 'provider', 'admin'],
      default: 'customer',
      required: true,
    },
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
    addressBook: [{
      label: { type: String, trim: true, maxlength: 60, default: '' },
      fullName: { type: String, trim: true, maxlength: 120, default: '' },
      phone: { type: String, trim: true, maxlength: 40, default: '' },
      addressLine1: { type: String, required: true, trim: true, maxlength: 180 },
      addressLine2: { type: String, trim: true, maxlength: 180, default: '' },
      city: { type: String, required: true, trim: true, maxlength: 100 },
      region: { type: String, trim: true, maxlength: 100, default: '' },
      postalCode: { type: String, trim: true, maxlength: 30, default: '' },
      country: { type: String, trim: true, maxlength: 100, default: 'Nepal' },
      isDefault: { type: Boolean, default: false },
    }],
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    age: {
      type: Number,
      min: 16,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Virtual wallet balance, stored in Korean won (integer). Credited via
    // admin-approved recharge requests and moved between accounts on orders/deliveries.
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    farmName: { type: String, trim: true },
    farmLocation: { type: String, trim: true },
    farmSizeAcres: { type: Number },
    cropTypes: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'mobile_pay', 'Credit / Debit Card', ''],
      default: '',
    },
    // Fix before merging to main: store accepted friendships for both users.
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // One-way follow relationships powering the social feed "Following" filter.
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    notificationPreferences: {
      soundEnabled: { type: Boolean, default: true },
      soundName: { type: String, trim: true, maxlength: 60, default: 'default' },
      desktopEnabled: { type: Boolean, default: true },
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

userSchema.pre('validate', function ensureSingleDefaultAddress(next) {
  let defaultFound = false;
  (this.addressBook || []).forEach((address) => {
    if (!address.isDefault) return;
    if (defaultFound) address.isDefault = false;
    defaultFound = true;
  });
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

userSchema.index({ role: 1, isActive: 1, createdAt: -1 });
userSchema.index({ role: 1, address: 1, createdAt: -1 });
userSchema.index({ friends: 1 });

module.exports = mongoose.model('User', userSchema);
