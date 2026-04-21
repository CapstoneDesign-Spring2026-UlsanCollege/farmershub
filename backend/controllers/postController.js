const Post = require('../models/Post');
const Product = require('../models/Product');
const Profile = require('../models/Profile');
const { buildMediaUrl } = require('../services/mediaUrlService');
const { toUploadPath } = require('../middleware/upload');

function serializePost(postDoc, req) {
    const imageUrls = (postDoc.imagePaths || []).map(path => buildMediaUrl(req, path));
    return {
        id: String(postDoc._id),
        content: postDoc.content,
        text: postDoc.content,
        caption: postDoc.content,
        imageUrls,
        image: imageUrls[0] || '',
        linkedProductId: postDoc.linkedProductId ? String(postDoc.linkedProductId) : null,
        author: {
            id: String(postDoc.author.userId),
            role: postDoc.author.role,
            name: postDoc.author.name,
            avatarUrl: buildMediaUrl(req, postDoc.author.avatarPath),
        },
        likesCount: postDoc.likes.length,
        likes: postDoc.likes.length,
        createdAt: postDoc.createdAt,
        updatedAt: postDoc.updatedAt,
    };
}

async function createPost(req, res) {
    try {
        const content = String(req.body.content || req.body.text || req.body.caption || '').trim();
        const linkedProductId = req.body.linkedProduct || req.body.linkedProductId || null;
        const files = req.files || [];

        if (!content && files.length === 0) {
            return res.status(400).json({ success: false, message: 'Post content or an image is required.' });
        }

        if (linkedProductId) {
            const linked = await Product.findById(linkedProductId);
            if (!linked) {
                return res.status(404).json({ success: false, message: 'Linked product not found.' });
            }
        }

        const profile = await Profile.findOne({ userId: req.user.id, role: req.user.role });
        const post = await Post.create({
            content,
            imagePaths: files.map(file => toUploadPath(file)),
            linkedProductId: linkedProductId || null,
            author: {
                userId: req.user.id,
                role: req.user.role,
                name: req.user.fullName,
                avatarPath: profile?.avatarPath || '',
            },
        });

        return res.status(201).json({
            success: true,
            message: 'Post created successfully.',
            data: serializePost(post, req),
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Failed to create post.' });
    }
}

async function getPosts(req, res) {
    try {
        const { farmerId, authorId, limit = 20 } = req.query;
        const query = {};
        const ownerId = farmerId || authorId;
        if (ownerId) query['author.userId'] = ownerId;

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .limit(Math.min(Number(limit) || 20, 100));

        return res.json({
            success: true,
            data: posts.map(post => serializePost(post, req)),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to load posts.' });
    }
}

async function updatePost(req, res) {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
        }

        if (String(post.author.userId) !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You can only update your own posts.' });
        }

        if (req.body.content !== undefined || req.body.text !== undefined || req.body.caption !== undefined) {
            post.content = String(req.body.content || req.body.text || req.body.caption || '').trim();
        }

        if (req.files && req.files.length) {
            post.imagePaths = req.files.map(file => toUploadPath(file));
        }

        await post.save();
        return res.json({ success: true, message: 'Post updated successfully.', data: serializePost(post, req) });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Failed to update post.' });
    }
}

async function toggleLike(req, res) {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
        }

        const likeKey = req.user.id;
        const liked = post.likes.includes(likeKey);
        post.likes = liked ? post.likes.filter(entry => entry !== likeKey) : [...post.likes, likeKey];
        await post.save();

        return res.json({
            success: true,
            message: liked ? 'Post unliked.' : 'Post liked.',
            data: serializePost(post, req),
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Failed to update like.' });
    }
}

async function deletePost(req, res) {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
        }

        if (String(post.author.userId) !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You can only delete your own posts.' });
        }

        await post.deleteOne();
        return res.json({ success: true, message: 'Post deleted successfully.' });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Failed to delete post.' });
    }
}

module.exports = {
    createPost,
    getPosts,
    updatePost,
    toggleLike,
    deletePost,
};