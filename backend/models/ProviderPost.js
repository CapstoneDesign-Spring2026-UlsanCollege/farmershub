const mongoose = require('mongoose');

/**
 * A photo/update post on a provider's profile timeline (business-page style).
 * Scoped to a single provider; not part of the global farmer/customer feed.
 */
const providerPostSchema = new mongoose.Schema(
  {
    provider: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      businessName: {
        type: String,
        default: '',
        trim: true,
      },
      avatarPath: {
        type: String,
        default: '',
      },
    },
    content: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },
    imagePaths: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

providerPostSchema.index({ 'provider.userId': 1, createdAt: -1 });

module.exports = mongoose.model('ProviderPost', providerPostSchema);
