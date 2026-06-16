const Product = require('../models/Product');
const { Order } = require('../models/Order');
const { buildMediaUrl } = require('../services/mediaUrlService');
const { toUploadPath } = require('../middleware/upload');
const { createNotification } = require('./notificationController');
const walletService = require('../services/walletService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

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
        rating: Number(productDoc.ratingAverage || 0),
        ratingCount: Number(productDoc.ratingCount || 0),
        seller: {
            id: String(productDoc.seller.userId),
            role: productDoc.seller.role,
            name: productDoc.seller.name,
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
            name: String(req.user.fullName || existing?.seller?.name || '').trim(),
            email: String(req.user.email || existing?.seller?.email || '').trim().toLowerCase(),
            phone: String(req.user.phone || existing?.seller?.phone || '').trim(),
            location: String(req.user.address || existing?.seller?.location || '').trim(),
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
        // Distinguish client mistakes (validation/cast/duplicate) from real
        // server faults so genuine outages are not hidden as 4xx and vice versa.
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Duplicate entry.' });
        }
        console.error('Failed to create product:', error);
        return res.status(500).json({ success: false, message: 'Failed to create product.' });
    }
}

async function getProducts(req, res) {
    try {
        const { category, search, farmerId, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
        const query = {};
        const pageNumber = Math.max(Number(page) || 1, 1);
        const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
        const skip = (pageNumber - 1) * pageSize;

        if (category) query.category = String(category).toLowerCase();
        if (farmerId) query['seller.userId'] = farmerId;
        if (minPrice || maxPrice) {
            query.sellingPrice = {};
            if (minPrice) query.sellingPrice.$gte = Number(minPrice);
            if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
        }

        let products;
        let total;
        if (search) {
            try {
                [products, total] = await Promise.all([
                    Product.find({ ...query, $text: { $search: search } })
                        .sort({ score: { $meta: 'textScore' } })
                        .skip(skip)
                        .limit(pageSize),
                    Product.countDocuments(query),
                ]);
            } catch {
                [products, total] = await Promise.all([
                    Product.find({ ...query, name: { $regex: search, $options: 'i' } })
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(pageSize),
                    Product.countDocuments(query),
                ]);
            }
        } else {
            [products, total] = await Promise.all([
                Product.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(pageSize),
                Product.countDocuments(query),
            ]);
        }

        return res.json({
            success: true,
            data: products.map(product => serializeProduct(product, req)),
            total,
            pages: Math.ceil(total / pageSize),
            page: pageNumber,
            limit: pageSize,
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

        if (req.user.role !== 'admin' && String(product.seller.userId) !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You can only delete your own products.' });
        }

        await product.deleteOne();
        return res.json({ success: true, message: 'Product deleted successfully.' });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Failed to delete product.' });
    }
}

/**
 * POST /api/products/:id/order
 * Place an order for a product (creates notification for seller).
 */
async function placeOrder(req, res, next) {
    try {
        const { quantity = 1, notes } = req.body;
        const quantityNumber = Number(quantity);
        if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
            return errorResponse(res, 'Quantity must be a positive number', 400);
        }

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, stock: { $gte: quantityNumber } },
            { $inc: { stock: -quantityNumber } },
            { new: true }
        );
        if (!product) {
            const exists = await Product.exists({ _id: req.params.id });
            return errorResponse(res, exists ? 'Insufficient stock available' : 'Product not found', exists ? 400 : 404);
        }

        const unitPrice = Number((product.sellingPrice - (product.sellingPrice * (product.discount || 0) / 100)).toFixed(2));
        let order;
        let attempts = 0;
        while (!order && attempts < 3) {
            attempts++;
            const ts = Date.now();
            const rand = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
            try {
                order = await Order.create({
                    orderNumber: `FH-${ts}-${rand}`,
                    product: {
                        productId: product._id,
                        name: product.name,
                        unit: product.unit,
                        unitPrice,
                    },
                    customer: {
                        userId: req.user._id,
                        name: req.user.fullName,
                        email: req.user.email,
                        phone: req.user.phone || '',
                    },
                    farmer: {
                        userId: product.seller.userId,
                        name: product.seller.name,
                        email: product.seller.email,
                        phone: product.seller.phone || '',
                    },
                    quantity: quantityNumber,
                    totalAmount: unitPrice * quantityNumber,
                    notes: String(notes || '').trim(),
                    statusHistory: [{
                        status: 'pending',
                        changedBy: req.user._id,
                        note: 'Order placed by customer',
                        changedAt: new Date(),
                    }],
                });
            } catch (error) {
                if (attempts >= 3 || error.code !== 11000) {
                    await Product.updateOne({ _id: product._id }, { $inc: { stock: quantityNumber } });
                    throw error;
                }
            }
        }

        // Move virtual money from the customer to the farmer for this order.
        try {
            const { transferId } = await walletService.transfer(
                req.user._id,
                product.seller.userId,
                order.totalAmount,
                {
                    type: 'order_payment',
                    debitDescription: `Order ${order.orderNumber} — ${product.name}`,
                    creditDescription: `Order ${order.orderNumber} — ${product.name}`,
                    fromCounterparty: walletService.counterpartyFrom(req.user),
                    toCounterparty: { userId: product.seller.userId, name: product.seller.name, role: 'farmer' },
                    relatedId: order._id,
                    relatedModel: 'Order',
                    insufficientMessage: 'Your wallet balance is too low for this order. Recharge your wallet and try again.',
                }
            );
            order.paymentStatus = 'paid';
            order.paymentTransferId = transferId;
            await order.save();
        } catch (error) {
            // Payment failed (usually insufficient funds): undo the order and restore stock.
            await Order.deleteOne({ _id: order._id });
            await Product.updateOne({ _id: product._id }, { $inc: { stock: quantityNumber } });
            if (error.statusCode === 400) {
                return errorResponse(res, error.message, 400);
            }
            throw error;
        }

        // Create notification for the seller
        const productDetails = `${quantityNumber} ${product.unit} of ${product.name}`;
        const body = notes
            ? `${productDetails}. Notes: ${notes}`
            : productDetails;

        try {
            await createNotification(
                product.seller.userId,
                'order',
                'New order request',
                body,
                order._id,
                'Order'
            );
        } catch {
            // The order and stock reservation remain valid if notification delivery fails.
        }

        return successResponse(res, 'Order placed successfully', {
            order,
            product: serializeProduct(product, req),
            quantity: quantityNumber,
            notes,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    placeOrder,
};
