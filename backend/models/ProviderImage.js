const mongoose = require('mongoose');

// Binary image storage for provider profiles, kept in its own collection so
// large image buffers don't bloat ProviderProfile/ProviderPost documents.
// Render's filesystem is ephemeral, so provider photos live in MongoDB
// instead of on disk.
const providerImageSchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    kind: {
      type: String,
      enum: ['avatar', 'cover', 'equipment', 'post'],
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    data: {
      type: Buffer,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProviderImage', providerImageSchema);
