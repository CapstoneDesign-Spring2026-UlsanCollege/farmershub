const mongoose = require('mongoose');

const VEHICLE_TYPES = ['bike', 'scooter', 'van', 'truck', 'refrigerated', 'other'];

/**
 * A delivery option hosted by a provider account. Farmers pick one of these when
 * shipping an order; the flat fee moves from the farmer's wallet to the provider's.
 */
const deliveryPartnerSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerName: { type: String, default: '', trim: true },
    name: {
      type: String,
      required: [true, 'Delivery partner name is required'],
      trim: true,
      maxlength: 120,
    },
    vehicleType: {
      type: String,
      enum: VEHICLE_TYPES,
      default: 'van',
    },
    coverageArea: { type: String, default: '', trim: true, maxlength: 160 },
    estimatedTime: { type: String, default: '', trim: true, maxlength: 80 },
    fee: {
      // Flat delivery fee in Korean won, paid by the farmer to the provider.
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

deliveryPartnerSchema.index({ provider: 1, createdAt: -1 });
deliveryPartnerSchema.index({ isActive: 1, fee: 1 });

module.exports = {
  DeliveryPartner: mongoose.model('DeliveryPartner', deliveryPartnerSchema),
  VEHICLE_TYPES,
};
