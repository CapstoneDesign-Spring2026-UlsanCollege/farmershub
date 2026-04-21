const Product = require('../models/Product');
const { buildMediaUrl } = require('../services/mediaUrlService');
const { toUploadPath } = require('../middleware/upload');

function firstValue(value, fallback = '') {
    if (Array.isArray(value)) return value[0] || fallback;
    return value ?? fallback;
}

function normalizePaymentMethods(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string' && value.trim()) return [value.trim()];
    return [];
}

function serializeProduct(productDoc, req) {
    const price = Number((productDoc.sellingPrice - (productDoc.sellingPrice * (productDoc.discount || 0) / 100)).toFixed(2));
    const imageUrl = buildMediaUrl(req, productDoc.imagePath);

    return {
        id: String(productDoc._id),
        name: productDoc.name,
        brand: productDoc.brand,
        description: productDoc.description,
        category: productDoc.category,
        costPrice: productDoc.costPrice,
        sellingPrice: productDoc.sellingPrice,
        discount: productDoc.discount,
        price,
        stock: productDoc.stock,
        unit: productDoc.unit,
        harvestDate: productDoc.harvestDate,
        expiryDate: productDoc.expiryDate,
        imageUrl,
        paymentMethods: productDoc.paymentMethods,
        seller: {
            id: String(productDoc.seller.userId),
            role: productDoc.seller.role,
            name: productDoc.seller.name,
            email: productDoc.seller.email,
            phone: productDoc.seller.phone,
            location: productDoc.seller.location,
        },
        createdAt: productDoc.createdAt,
        updatedAt: productDoc.updatedAt,
    };
}

function buildProductPayload(req, existing = null) {
    const body = req.body || {};
    const paymentMethods = normalizePaymentMethods(body['paymentMethods[]'] || body.paymentMethods);
    const imagePath = req.file ? toUploadPath(req.file) : existing?.imagePath || '';
    const sellerLocation = firstValue(body.location, req.user.address || existing?.seller?.location || '');

    return {
        name: firstValue(body.name, existing?.name || '').trim(),
        brand: firstValue(body.brand, existing?.brand || '').trim(),
        description: firstValue(body.description, existing?.description || '').trim(),
        category: firstValue(body.category, existing?.category || 'other').trim().toLowerCase(),
        costPrice: Number(firstValue(body.costPrice, existing?.costPrice ?? 0) || 0),
        sellingPrice: Number(firstValue(body.sellingPrice, existing?.sellingPrice ?? 0) || 0),
        discount: Number(firstValue(body.discount, existing?.discount ?? 0) || 0),
        stock: Number(firstValue(body.stock, existing?.stock ?? 0) || 0),
        unit: firstValue(body.unit, existing?.unit || 'pcs').trim() || 'pcs',
        harvestDate: firstValue(body.harvestDate, existing?.harvestDate || null) || null,
        expiryDate: firstValue(body.expiryDate, existing?.expiryDate || null) || null,
        paymentMethods: paymentMethods.length ? paymentMethods : (existing?.paymentMethods || []),
        imagePath,
        seller: {
            userId: req.user.id,
            userModel: 'User',
            role: req.user.role,
            name: firstValue(body.sellerName, req.user.fullName || existing?.seller?.name || '').trim(),
            email: firstValue(body.sellerEmail, req.user.email || existing?.seller?.email || '').trim().toLowerCase(),
            phone: firstValue(body.sellerPhone, req.user.phone || existing?.seller?.phone || '').trim(),
            location: sellerLocation.trim(),
        },
    };
}

async function createProduct(req, res) {
    try {
        const payload = buildProductPayload(req);

        if (!payload.name || !payload.sellingPrice) {
            return res.status(400).json({ success: false, message: 'Product name and selling price are required.' });
        }

        const product = await Product.create(payload);
        return res.status(201).json({
            success: true,
            message: 'Product created successfully.',
            data: serializeProduct(product, req),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to create product.' });
    }
}

async function getProducts(req, res) {
    try {
        const { category, search, farmerId, minPrice, maxPrice, limit = 20 } = req.query;
        const query = {};

        if (category) query.category = String(category).toLowerCase();
        if (farmerId) query['seller.userId'] = farmerId;
        if (search) query.$text = { $search: search };
        if (minPrice || maxPrice) {
            query.sellingPrice = {};
            if (minPrice) query.sellingPrice.$gte = Number(minPrice);
            if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
        }

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .limit(Math.min(Number(limit) || 20, 100));

        return res.json({
            success: true,
            data: products.map(product => serializeProduct(product, req)),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to load products.' });
    }
}

async function getProductById(req, res) {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        return res.json({ success: true, data: serializeProduct(product, req) });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Invalid product id.' });
    }
}

async function updateProduct(req, res) {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        if (String(product.seller.userId) !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You can only update your own products.' });
        }

        const payload = buildProductPayload(req, product);
        Object.assign(product, payload);
        await product.save();

        return res.json({
            success: true,
            message: 'Product updated successfully.',
            data: serializeProduct(product, req),
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Failed to update product.' });
    }
}

async function deleteProduct(req, res) {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        if (String(product.seller.userId) !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You can only delete your own products.' });
        }

        await product.deleteOne();
        return res.json({ success: true, message: 'Product deleted successfully.' });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Failed to delete product.' });
    }
}

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};