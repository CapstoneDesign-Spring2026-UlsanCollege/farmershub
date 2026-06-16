/**
 * seed.js — Creates demo data for FarmersHub demonstrations.
 *
 * Demo accounts created:
 *   Farmer:   farmer@demo.com  / demo1234
 *   Customer: customer@demo.com / demo1234
 *
 * Usage:
 *   cd backend
 *   node seed.js
 *
 * Safe to re-run — existing demo accounts/data are cleared first.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Product = require('./models/Product');
const Post = require('./models/Post');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmershub';

async function seed() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to:', MONGO_URI);

    // ── Clear existing demo data ──────────────────────────────────────────────
    const demoEmails = ['farmer@demo.com', 'customer@demo.com'];
    const existingUsers = await User.find({ email: { $in: demoEmails } });
    const existingIds = existingUsers.map(u => u._id);

    if (existingIds.length > 0) {
        await Product.deleteMany({ 'seller.userId': { $in: existingIds } });
        await Post.deleteMany({ 'author.userId': { $in: existingIds } });
        await Profile.deleteMany({ userId: { $in: existingIds } });
        await User.deleteMany({ _id: { $in: existingIds } });
        console.log('Cleared existing demo data.');
    }

    // ── Create demo farmer ────────────────────────────────────────────────────
    const farmer = await User.create({
        fullName: 'John Green',
        email: 'farmer@demo.com',
        password: 'demo1234',
        role: 'farmer',
        age: 35,
        gender: 'male',
        address: 'Springfield Valley Farm, Colorado',
        phone: '+1 (555) 100-2000',
        paymentMethod: 'cash',
    });
    console.log('Created farmer:', farmer.email);

    // ── Create demo customer ──────────────────────────────────────────────────
    const customer = await User.create({
        fullName: 'Sara Lee',
        email: 'customer@demo.com',
        password: 'demo1234',
        role: 'customer',
        age: 28,
        gender: 'female',
        address: '123 Main Street, Denver, CO',
        phone: '+1 (555) 200-3000',
        paymentMethod: 'card',
        walletBalance: 300000,
    });
    console.log('Created customer:', customer.email);

    // ── Create farmer profile ─────────────────────────────────────────────────
    await Profile.create({
        userId: farmer._id,
        role: 'farmer',
        bio: 'Family-owned organic farm growing fresh vegetables, fruits, and grains for 15 years. We believe in sustainable, pesticide-free farming.',
        location: 'Springfield Valley, Colorado',
        farmName: 'Green Valley Organics',
        products: 'Tomatoes, Corn, Potatoes, Apples',
        cropTypes: ['Tomatoes', 'Corn', 'Potatoes', 'Apples'],
        farmLocation: 'Springfield Valley, Colorado',
        farmSizeAcres: 45,
    });

    // ── Create customer profile ───────────────────────────────────────────────
    await Profile.create({
        userId: customer._id,
        role: 'customer',
        bio: 'Health-conscious shopper who loves fresh, locally sourced produce.',
        location: 'Denver, Colorado',
    });
    console.log('Created profiles.');

    // ── Create demo products ──────────────────────────────────────────────────
    const sellerInfo = {
        userId: farmer._id,
        userModel: 'User',
        role: 'farmer',
        name: farmer.fullName,
        email: farmer.email,
        phone: farmer.phone,
        location: 'Springfield Valley, Colorado',
    };

    const products = await Product.insertMany([
        {
            name: 'Organic Tomatoes',
            description: 'Vine-ripened, sun-grown organic tomatoes. Perfect for salads, sauces, and fresh eating. No pesticides, no GMOs.',
            brand: 'Green Valley Organics',
            category: 'vegetables',
            costPrice: 1.50,
            sellingPrice: 3.50,
            discount: 0,
            stock: 120,
            unit: 'lbs',
            harvestDate: new Date('2026-04-18'),
            expiryDate: new Date('2026-05-20'),
            paymentMethods: ['cash', 'card'],
            imagePath: '',
            seller: sellerInfo,
        },
        {
            name: 'Sweet Corn',
            description: 'Freshly harvested sweet corn. Picked at peak ripeness for maximum flavor. Great for grilling, boiling, or roasting.',
            brand: 'Green Valley Organics',
            category: 'vegetables',
            costPrice: 0.75,
            sellingPrice: 2.00,
            discount: 10,
            stock: 200,
            unit: 'piece',
            harvestDate: new Date('2026-04-20'),
            expiryDate: new Date('2026-05-10'),
            paymentMethods: ['cash', 'card', 'bank_transfer'],
            imagePath: '',
            seller: sellerInfo,
        },
        {
            name: 'Honeycrisp Apples',
            description: 'Hand-picked Honeycrisp apples. Sweet, crisp, and refreshing — perfect for snacking, pies, and juicing.',
            brand: 'Green Valley Organics',
            category: 'fruits',
            costPrice: 1.20,
            sellingPrice: 4.00,
            discount: 0,
            stock: 85,
            unit: 'lbs',
            harvestDate: new Date('2026-04-15'),
            expiryDate: new Date('2026-06-01'),
            paymentMethods: ['cash', 'mobile_pay'],
            imagePath: '',
            seller: sellerInfo,
        },
        {
            name: 'Russet Potatoes',
            description: 'Large, starchy russet potatoes ideal for baking, mashing, or frying. Freshly dug from our Colorado fields.',
            brand: 'Green Valley Organics',
            category: 'vegetables',
            costPrice: 0.50,
            sellingPrice: 1.80,
            discount: 5,
            stock: 300,
            unit: 'lbs',
            harvestDate: new Date('2026-04-10'),
            expiryDate: new Date('2026-07-01'),
            paymentMethods: ['cash', 'card', 'bank_transfer'],
            imagePath: '',
            seller: sellerInfo,
        },
    ]);
    console.log('Created', products.length, 'products.');

    // ── Create demo posts ─────────────────────────────────────────────────────
    const authorInfo = {
        userId: farmer._id,
        role: 'farmer',
        name: farmer.fullName,
        avatarPath: '',
    };

    const posts = await Post.insertMany([
        {
            content: '🌱 Spring harvest is here! We just picked our first batch of Honeycrisp apples this season. Fresh, sweet, and ready to go — come grab some before they sell out! Available for pickup at Green Valley Organics.',
            imagePaths: [],
            author: authorInfo,
            likes: [],
        },
        {
            content: '🍅 Our organic tomatoes are back in full season! Vine-ripened, zero pesticides, full of flavor. Perfect for summer sauces, salads, and sandwiches. 120 lbs available — order via FarmersHub today.',
            imagePaths: [],
            author: authorInfo,
            likes: [],
        },
        {
            content: '🌽 Sweet corn season is officially open! We harvested 200 ears this morning and they are peak-fresh. Great for your BBQ this weekend. Cash, card, and bank transfer accepted.',
            imagePaths: [],
            author: authorInfo,
            likes: [],
        },
    ]);
    console.log('Created', posts.length, 'posts.');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅  Seed complete! FarmersHub demo data is ready.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Farmer account:   farmer@demo.com   / demo1234');
    console.log('  Customer account: customer@demo.com / demo1234');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.disconnect();
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
