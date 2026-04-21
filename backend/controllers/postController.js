const Post = require('../models/Post');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * POST /api/posts
 * Creates a new feed post. Farmer role only.
 */
const createPost = async (req, res, next) => {
  try {
    const { content, linkedProduct, tags } = req.body;

    const images = req.files
      ? req.files.map((f) => ({ url: `/uploads/${f.filename}`, publicId: f.filename }))
      : [];

    const post = await Post.create({
      author: req.user._id,
      content,
      images,
      linkedProduct: linkedProduct || undefined,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
    });

    const populated = await post.populate('author', 'fullName avatar farmName isVerified');
    return successResponse(res, 'Post created', populated, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/posts
 * Returns the paginated feed (all published posts, newest first).
 * Optionally filter by author (farmerId).
 */
const getFeed = async (req, res, next) => {
  try {
    const { farmerId, page = 1, limit = 10 } = req.query;
    const filter = { isPublished: true };
    if (farmerId) filter.author = farmerId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'fullName avatar farmName isVerified')
        .populate('linkedProduct', 'title price images category')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Post.countDocuments(filter),
    ]);

    return successResponse(res, 'Feed posts', {
      posts,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/posts/:id/like
 * Toggles a like on a post for the authenticated user.
 */
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return errorResponse(res, 'Post not found', 404);

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.map((id) => id.toString()).includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likes.push(req.user._id);
      post.likesCount += 1;
    }

    await post.save();
    return successResponse(res, alreadyLiked ? 'Post unliked' : 'Post liked', {
      liked: !alreadyLiked,
      likesCount: post.likesCount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/posts/:id
 * Deletes a post. Only the author or an admin may delete.
 */
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return errorResponse(res, 'Post not found', 404);

    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return errorResponse(res, 'Not authorized to delete this post', 403);
    }

    await post.deleteOne();
    return successResponse(res, 'Post deleted', null);
  } catch (err) {
    next(err);
  }
};

module.exports = { createPost, getFeed, likePost, deletePost };
