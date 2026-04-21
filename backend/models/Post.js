const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        default: '',
        trim: true,
    },
    imagePaths: {
        type: [String],
        default: [],
    },
    linkedProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null,
    },
    author: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
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
        avatarPath: {
            type: String,
            default: '',
        },
    },
    likes: {
        type: [String],
        default: [],
    },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);