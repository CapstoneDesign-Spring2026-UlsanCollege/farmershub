const mongoose = require('mongoose');

const SERVICE_REQUEST_STATUSES = ['new', 'quoted', 'accepted', 'declined', 'cancelled', 'completed'];

const farmServiceRequestSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmServiceListing',
      required: true,
    },
    provider: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      businessName: {
        type: String,
        required: true,
        trim: true,
      },
    },
    farmer: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        default: '',
        trim: true,
      },
      location: {
        type: String,
        default: '',
        trim: true,
      },
    },
    status: {
      type: String,
      enum: SERVICE_REQUEST_STATUSES,
      default: 'new',
    },
    farmLocation: {
      type: String,
      required: [true, 'Farm location is required'],
      trim: true,
      maxlength: 180,
    },
    needDescription: {
      type: String,
      required: [true, 'Description of need is required'],
      trim: true,
      maxlength: 2000,
    },
    preferredStartDate: Date,
    preferredEndDate: Date,
    acreageOrQuantity: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    budget: {
      type: Number,
      min: 0,
      default: 0,
    },
    contactPreference: {
      type: String,
      enum: ['message', 'phone', 'email', 'message_or_phone', ''],
      default: 'message',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1200,
    },
    quote: {
      amount: {
        type: Number,
        min: 0,
        default: 0,
      },
      pricingType: {
        type: String,
        default: '',
        trim: true,
      },
      notes: {
        type: String,
        default: '',
        trim: true,
        maxlength: 1200,
      },
      validUntil: Date,
      quotedAt: Date,
    },
    declineReason: {
      type: String,
      default: '',
      trim: true,
      maxlength: 800,
    },
    completedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

farmServiceRequestSchema.index({ 'farmer.userId': 1, status: 1, createdAt: -1 });
farmServiceRequestSchema.index({ 'provider.userId': 1, status: 1, createdAt: -1 });
farmServiceRequestSchema.index({ listing: 1, createdAt: -1 });

module.exports = {
  FarmServiceRequest: mongoose.model('FarmServiceRequest', farmServiceRequestSchema),
  SERVICE_REQUEST_STATUSES,
};
