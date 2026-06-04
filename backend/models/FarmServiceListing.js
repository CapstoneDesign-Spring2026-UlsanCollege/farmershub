const mongoose = require('mongoose');

const SERVICE_CATEGORIES = [
  'equipment_rental',
  'tractor',
  'tiller',
  'harvester',
  'seeder',
  'sprayer',
  'irrigation_water',
  'irrigation_pump',
  'drip_irrigation_setup',
  'water_tank_delivery',
  'irrigation_repair',
  'transport_logistics',
  'delivery_truck',
  'produce_pickup',
  'market_transport',
  'refrigerated_delivery',
  'storage_post_harvest',
  'cold_storage',
  'temporary_warehouse_space',
  'packaging_support',
  'sorting_grading',
  'farm_inputs',
  'fertilizer',
  'fertilizer_supply',
  'compost_supply',
  'seeds',
  'mulch',
  'soil_amendments',
  'specialist_services',
  'soil_testing',
  'pest_inspection',
  'equipment_repair',
  'crop_consultation',
  'greenhouse_installation',
];

const LISTING_TYPES = ['rental', 'service', 'transport', 'storage', 'input_supply', 'consultation', 'repair'];
const PRICING_TYPES = ['fixed', 'per_hour', 'per_day', 'per_acre', 'per_delivery', 'per_unit', 'quote_required'];

const farmServiceListingSchema = new mongoose.Schema(
  {
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
      serviceArea: {
        type: String,
        default: '',
        trim: true,
      },
    },
    title: {
      type: String,
      required: [true, 'Listing title is required'],
      trim: true,
      maxlength: 140,
    },
    category: {
      type: String,
      required: true,
      enum: SERVICE_CATEGORIES,
      trim: true,
    },
    listingType: {
      type: String,
      required: true,
      enum: LISTING_TYPES,
    },
    pricingType: {
      type: String,
      required: true,
      enum: PRICING_TYPES,
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
    },
    unitLabel: {
      type: String,
      default: '',
      trim: true,
      maxlength: 60,
    },
    serviceArea: {
      type: String,
      required: [true, 'Service area is required'],
      trim: true,
      maxlength: 180,
    },
    availability: {
      type: String,
      default: '',
      trim: true,
      maxlength: 240,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    equipmentDetails: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1200,
    },
    termsSummary: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1200,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

farmServiceListingSchema.index({ isActive: 1, category: 1, createdAt: -1 });
farmServiceListingSchema.index({ 'provider.userId': 1, isActive: 1, createdAt: -1 });
farmServiceListingSchema.index({ title: 'text', description: 'text', serviceArea: 'text', 'provider.businessName': 'text' });

module.exports = {
  FarmServiceListing: mongoose.model('FarmServiceListing', farmServiceListingSchema),
  SERVICE_CATEGORIES,
  LISTING_TYPES,
  PRICING_TYPES,
};
