const ProviderProfile = require('../models/ProviderProfile');
const ProviderPost = require('../models/ProviderPost');
const ProviderImage = require('../models/ProviderImage');
const { FarmServiceListing } = require('../models/FarmServiceListing');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const MAX_EQUIPMENT_IMAGES = 30;
const IMAGE_PATH_PATTERN = /\/providers\/images\/([a-f0-9]{24})$/i;

// Persist an uploaded image buffer in its own MongoDB collection and return
// the "/api/providers/images/<id>" path the rest of the app stores/serves.
async function saveProviderImage(ownerUserId, kind, file) {
  const image = await ProviderImage.create({
    ownerUserId,
    kind,
    contentType: file.mimetype,
    data: file.buffer,
  });
  return `/api/providers/images/${image._id}`;
}

// Delete a stored "/api/providers/images/<id>" image document; ignore if missing.
async function removeStoredImage(storedPath) {
  const match = typeof storedPath === 'string' ? storedPath.match(IMAGE_PATH_PATTERN) : null;
  if (!match) return;
  await ProviderImage.deleteOne({ _id: match[1] }).catch(() => {});
}

function asString(value, fallback = '') {
  return String(value ?? fallback).trim();
}

function filesFrom(req) {
  if (Array.isArray(req.files)) return req.files;
  if (req.file) return [req.file];
  return [];
}

function serializeEquipment(item) {
  return {
    id: String(item._id),
    imagePath: item.imagePath,
    caption: item.caption || '',
    createdAt: item.createdAt,
  };
}

function serializeProviderPost(post) {
  return {
    id: String(post._id),
    content: post.content || '',
    imagePaths: post.imagePaths || [],
    provider: {
      id: String(post.provider.userId),
      businessName: post.provider.businessName || '',
      avatarPath: post.provider.avatarPath || '',
    },
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

function asStringArray(value) {
  if (Array.isArray(value)) return value.map((item) => asString(item)).filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function userIdOf(user) {
  return user?._id || user?.id;
}

function serializeProviderProfile(profile, user, { publicOnly = false } = {}) {
  const base = {
    id: String(profile.userId),
    userId: String(profile.userId),
    fullName: user?.fullName || '',
    role: 'provider',
    businessName: profile.businessName,
    businessType: profile.businessType,
    serviceCategories: profile.serviceCategories,
    serviceArea: profile.serviceArea,
    location: profile.location,
    bio: profile.bio,
    website: profile.website,
    contactPreference: profile.contactPreference,
    operatingHours: profile.operatingHours,
    verificationStatus: profile.verificationStatus,
    isOnboarded: profile.isOnboarded,
    avatar: profile.avatar || '',
    coverImage: profile.coverImage || '',
    equipment: (profile.equipment || []).map(serializeEquipment),
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };

  if (!publicOnly) {
    base.email = user?.email || '';
    base.phone = user?.phone || '';
    base.publicEmail = profile.publicEmail;
    base.publicPhone = profile.publicPhone;
  } else {
    base.publicEmail = profile.publicEmail;
    base.publicPhone = profile.publicPhone;
  }

  return base;
}

async function ensureProviderProfile(user) {
  const userId = userIdOf(user);
  let profile = await ProviderProfile.findOne({ userId });
  if (!profile) {
    profile = await ProviderProfile.create({
      userId,
      businessName: user.fullName ? `${user.fullName} Services` : 'Provider Services',
      location: user.address || '',
      publicPhone: user.phone || '',
      publicEmail: user.email || '',
    });
  }
  return profile;
}

function buildProfileUpdates(body = {}) {
  const updates = {};
  [
    'businessName',
    'businessType',
    'serviceArea',
    'location',
    'bio',
    'publicEmail',
    'publicPhone',
    'website',
    'contactPreference',
    'operatingHours',
  ].forEach((field) => {
    if (body[field] !== undefined) updates[field] = asString(body[field]);
  });

  if (body.serviceCategories !== undefined) {
    updates.serviceCategories = asStringArray(body.serviceCategories);
  }

  const businessName = updates.businessName;
  const serviceArea = updates.serviceArea;
  if (businessName || serviceArea || updates.serviceCategories?.length) {
    updates.isOnboarded = Boolean(
      asString(businessName || body.currentBusinessName || '') ||
      asString(serviceArea || body.currentServiceArea || '') ||
      updates.serviceCategories?.length
    );
  }

  return updates;
}

async function getProviderProfile(req, res, next) {
  try {
    const profile = await ensureProviderProfile(req.user);
    return successResponse(res, 'Provider profile', serializeProviderProfile(profile, req.user));
  } catch (err) {
    next(err);
  }
}

async function updateProviderProfile(req, res, next) {
  try {
    const profile = await ensureProviderProfile(req.user);
    const updates = buildProfileUpdates({
      ...req.body,
      currentBusinessName: profile.businessName,
      currentServiceArea: profile.serviceArea,
    });

    Object.assign(profile, updates);
    profile.isOnboarded = Boolean(profile.businessName && profile.serviceArea);
    await profile.save();

    return successResponse(res, 'Provider profile updated', serializeProviderProfile(profile, req.user));
  } catch (err) {
    next(err);
  }
}

async function getProviderPublicProfile(req, res, next) {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.params.id });
    if (!profile) {
      return errorResponse(res, 'Provider profile not found', 404);
    }

    const [listings, posts] = await Promise.all([
      FarmServiceListing.find({
        'provider.userId': profile.userId,
        isActive: true,
      })
        .sort({ createdAt: -1 })
        .limit(20),
      ProviderPost.find({ 'provider.userId': profile.userId })
        .sort({ createdAt: -1 })
        .limit(50),
    ]);

    return successResponse(res, 'Provider public profile', {
      profile: serializeProviderProfile(profile, { fullName: profile.businessName }, { publicOnly: true }),
      posts: posts.map(serializeProviderPost),
      listings: listings.map((listing) => ({
        id: String(listing._id),
        title: listing.title,
        category: listing.category,
        listingType: listing.listingType,
        pricingType: listing.pricingType,
        price: listing.price,
        unitLabel: listing.unitLabel,
        serviceArea: listing.serviceArea,
        availability: listing.availability,
        description: listing.description,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/providers/profile/avatar — set the provider's profile picture.
async function uploadProviderAvatar(req, res, next) {
  try {
    if (!req.file) return errorResponse(res, 'No image uploaded', 400);
    const profile = await ensureProviderProfile(req.user);
    await removeStoredImage(profile.avatar);
    profile.avatar = await saveProviderImage(userIdOf(req.user), 'avatar', req.file);
    await profile.save();
    return successResponse(res, 'Profile picture updated', serializeProviderProfile(profile, req.user));
  } catch (err) {
    next(err);
  }
}

// POST /api/providers/profile/cover — set the provider's cover banner.
async function uploadProviderCover(req, res, next) {
  try {
    if (!req.file) return errorResponse(res, 'No image uploaded', 400);
    const profile = await ensureProviderProfile(req.user);
    await removeStoredImage(profile.coverImage);
    profile.coverImage = await saveProviderImage(userIdOf(req.user), 'cover', req.file);
    await profile.save();
    return successResponse(res, 'Cover image updated', serializeProviderProfile(profile, req.user));
  } catch (err) {
    next(err);
  }
}

// POST /api/providers/profile/equipment — add one or more equipment photos.
async function addEquipmentImages(req, res, next) {
  try {
    const files = filesFrom(req);
    if (!files.length) return errorResponse(res, 'No images uploaded', 400);

    const profile = await ensureProviderProfile(req.user);
    if ((profile.equipment?.length || 0) + files.length > MAX_EQUIPMENT_IMAGES) {
      return errorResponse(res, `You can keep at most ${MAX_EQUIPMENT_IMAGES} equipment photos`, 400);
    }

    const caption = asString(req.body.caption).slice(0, 160);
    const userId = userIdOf(req.user);
    for (const file of files) {
      const imagePath = await saveProviderImage(userId, 'equipment', file);
      profile.equipment.push({ imagePath, caption });
    }
    await profile.save();
    return successResponse(res, 'Equipment photos added', serializeProviderProfile(profile, req.user));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/providers/profile/equipment/:imageId — remove one equipment photo.
async function deleteEquipmentImage(req, res, next) {
  try {
    const profile = await ensureProviderProfile(req.user);
    const item = profile.equipment.id(req.params.imageId);
    if (!item) return errorResponse(res, 'Equipment photo not found', 404);

    await removeStoredImage(item.imagePath);
    item.deleteOne();
    await profile.save();
    return successResponse(res, 'Equipment photo removed', serializeProviderProfile(profile, req.user));
  } catch (err) {
    next(err);
  }
}

// POST /api/providers/profile/posts — create a timeline post (caption + photos).
async function createProviderPost(req, res, next) {
  try {
    const files = filesFrom(req);
    const content = asString(req.body.content).slice(0, 2000);
    if (!content && !files.length) {
      return errorResponse(res, 'Add a caption or at least one photo', 400);
    }

    const profile = await ensureProviderProfile(req.user);
    const userId = userIdOf(req.user);
    const imagePaths = [];
    for (const file of files) {
      imagePaths.push(await saveProviderImage(userId, 'post', file));
    }
    const post = await ProviderPost.create({
      provider: {
        userId,
        businessName: profile.businessName,
        avatarPath: profile.avatar || '',
      },
      content,
      imagePaths,
    });
    return successResponse(res, 'Post published', serializeProviderPost(post), 201);
  } catch (err) {
    next(err);
  }
}

// GET /api/providers/profile/posts — the signed-in provider's own posts.
async function getMyProviderPosts(req, res, next) {
  try {
    const posts = await ProviderPost.find({ 'provider.userId': userIdOf(req.user) })
      .sort({ createdAt: -1 })
      .limit(50);
    return successResponse(res, 'Provider posts', { posts: posts.map(serializeProviderPost) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/providers/profile/posts/:postId — delete one of the provider's posts.
async function deleteProviderPost(req, res, next) {
  try {
    const post = await ProviderPost.findOne({
      _id: req.params.postId,
      'provider.userId': userIdOf(req.user),
    });
    if (!post) return errorResponse(res, 'Post not found', 404);

    await Promise.all((post.imagePaths || []).map(removeStoredImage));
    await post.deleteOne();
    return successResponse(res, 'Post deleted', { id: String(post._id) });
  } catch (err) {
    next(err);
  }
}

// GET /api/providers/images/:imageId — stream a stored provider image's bytes.
async function getProviderImage(req, res, next) {
  try {
    const image = await ProviderImage.findById(req.params.imageId).select('data contentType');
    if (!image) return errorResponse(res, 'Image not found', 404);

    res.set('Content-Type', image.contentType);
    res.set('Cache-Control', 'public, max-age=604800, immutable');
    return res.send(image.data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProviderProfile,
  updateProviderProfile,
  getProviderPublicProfile,
  uploadProviderAvatar,
  uploadProviderCover,
  addEquipmentImages,
  deleteEquipmentImage,
  createProviderPost,
  getMyProviderPosts,
  deleteProviderPost,
  getProviderImage,
};
