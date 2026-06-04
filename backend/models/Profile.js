const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['farmer', 'customer', 'provider'],
    },
    bio: {
        type: String,
        default: '',
        trim: true,
    },
    location: {
        type: String,
        default: '',
        trim: true,
    },
    farmName: {
        type: String,
        default: '',
        trim: true,
    },
    products: {
        type: String,
        default: '',
        trim: true,
    },
    cropTypes: {
        type: [String],
        default: [],
    },
    farmLocation: {
        type: String,
        default: '',
        trim: true,
    },
    farmSizeAcres: {
        type: Number,
        default: 0,
        min: 0,
    },
    avatarPath: {
        type: String,
        default: '',
    },
    coverPath: {
        type: String,
        default: '',
    },
}, { timestamps: true });

profileSchema.index({ userId: 1, role: 1 });
profileSchema.index({ role: 1, location: 1 });
profileSchema.index({ role: 1, farmLocation: 1 });

module.exports = mongoose.model('Profile', profileSchema);
