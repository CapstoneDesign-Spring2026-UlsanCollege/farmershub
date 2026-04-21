const mongoose = require('mongoose');

/**
 * Post model — farmer feed posts (updates, harvest news, promotions).
 */
const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: 2000,
    },
    images: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    // Optional product tag — link post to a listed product
    linkedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ content: 'text' });

module.exports = mongoose.model('Post', postSchema);
