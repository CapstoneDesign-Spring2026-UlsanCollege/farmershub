const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    brand: {
        type: String,
        default: '',
        trim: true,
    },
    category: {
        type: String,
        default: 'other',
        trim: true,
        lowercase: true,
    },
    costPrice: {
        type: Number,
        default: 0,
        min: 0,
    },
    sellingPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
    },
    stock: {
        type: Number,
        default: 0,
        min: 0,
    },
    unit: {
        type: String,
        default: 'pcs',
        trim: true,
    },
    harvestDate: Date,
    expiryDate: Date,
    paymentMethods: {
        type: [String],
        default: [],
    },
    imagePath: {
        type: String,
        default: '',
    },
    seller: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'seller.userModel',
        },
        userModel: {
            type: String,
            required: true,
            enum: ['User', 'Farmer', 'Customer'],
            default: 'User',
        },
        role: {
            type: String,
            required: true,
            enum: ['farmer', 'customer'],
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
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
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);