const User = require('../models/User');
const Product = require('../models/Product');
const Post = require('../models/Post');
const Profile = require('../models/Profile');
const { buildMediaUrl } = require('../services/mediaUrlService');

async function listFarmers(req, res) {
    try {
        const { search, location, page = 1, limit = 50 } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
            ];
        }

        query.role = 'farmer';

        if (location) {
            query.address = { $regex: location, $options: 'i' };
        }

        const pageNumber = Math.max(Number(page) || 1, 1);
        const pageSize = Math.min(Math.max(Number(limit) || 50, 1), 100);
        const skip = (pageNumber - 1) * pageSize;

        const farmers = await User.find(query, '-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        const farmerIds = farmers.map(farmer => farmer._id);
        const profiles = await Profile.find({ userId: { $in: farmerIds }, role: 'farmer' });
        const profileMap = new Map(profiles.map(profile => [String(profile.userId), profile]));

        return res.json({
            success: true,
            data: farmers.map(farmer => ({
                id: String(farmer._id),
                fullName: farmer.fullName,
                email: farmer.email,
                phone: farmer.phone,
                address: farmer.address,
                paymentMethod: farmer.paymentMethod,
                location: profileMap.get(String(farmer._id))?.location || farmer.address,
                farmName: profileMap.get(String(farmer._id))?.farmName || '',
                farmType: profileMap.get(String(farmer._id))?.cropTypes?.join(', ') || '',
                bio: profileMap.get(String(farmer._id))?.bio || '',
                avatarUrl: buildMediaUrl(req, profileMap.get(String(farmer._id))?.avatarPath || ''),
                createdAt: farmer.createdAt,
            })),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to load farmers.' });
    }
}

async function getFarmerById(req, res) {
    try {
        const farmer = await User.findOne({ _id: req.params.id, role: 'farmer' }, '-password');
        if (!farmer) {
            return res.status(404).json({ success: false, message: 'Farmer not found.' });
        }

        const [profile, products, posts] = await Promise.all([
            Profile.findOne({ userId: farmer._id, role: 'farmer' }),
            Product.find({ 'seller.userId': farmer._id }).sort({ createdAt: -1 }).limit(20),
            Post.find({ 'author.userId': farmer._id }).sort({ createdAt: -1 }).limit(20),
        ]);

        return res.json({
            success: true,
            data: {
                id: String(farmer._id),
                fullName: farmer.fullName,
                email: farmer.email,
                phone: farmer.phone,
                address: farmer.address,
                bio: profile?.bio || '',
                location: profile?.location || farmer.address,
                farmName: profile?.farmName || '',
                productsLabel: profile?.products || '',
                cropTypes: profile?.cropTypes || [],
                avatarUrl: buildMediaUrl(req, profile?.avatarPath || ''),
                coverUrl: buildMediaUrl(req, profile?.coverPath || ''),
                products: products.map(product => ({
                    id: String(product._id),
                    name: product.name,
                    category: product.category,
                    price: product.sellingPrice,
                    image: buildMediaUrl(req, product.imagePath),
                })),
                posts: posts.map(post => ({
                    id: String(post._id),
                    content: post.content,
                    image: post.imagePaths?.[0] ? buildMediaUrl(req, post.imagePaths[0]) : '',
                    createdAt: post.createdAt,
                })),
            },
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Invalid farmer id.' });
    }
}

module.exports = {
    listFarmers,
    getFarmerById,
};