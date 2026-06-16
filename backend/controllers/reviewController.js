const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { Order } = require('../models/Order');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

function toApi(review) {
  return {
    id: String(review._id),
    rating: review.rating,
    comment: review.comment || '',
    customerName: review.customer?.name || 'Customer',
    customerId: String(review.customer?.userId || ''),
    createdAt: review.createdAt,
  };
}

async function aggregateRating(match) {
  const stats = await Review.aggregate([
    { $match: match },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  return {
    avg: stats[0] ? Number(stats[0].avg.toFixed(2)) : 0,
    count: stats[0] ? stats[0].count : 0,
  };
}

// GET /api/products/:id/reviews — public.
const listProductReviews = async (req, res, next) => {
  try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return errorResponse(res, 'Invalid product id', 400);
    }
    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    const count = reviews.length;
    const average = count
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / count).toFixed(2))
      : 0;

    return successResponse(res, 'Product reviews', {
      summary: { average, count },
      reviews: reviews.map(toApi),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/products/:id/reviews — customer who has ordered the product.
const createProductReview = async (req, res, next) => {
  try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return errorResponse(res, 'Invalid product id', 400);
    }

    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return errorResponse(res, 'Rating must be a whole number from 1 to 5', 400);
    }

    const product = await Product.findById(productId).select('seller');
    if (!product) return errorResponse(res, 'Product not found', 404);

    const purchased = await Order.exists({
      'product.productId': productId,
      'customer.userId': req.user._id,
    });
    if (!purchased) {
      return errorResponse(res, 'You can only review products you have ordered', 403);
    }

    const alreadyReviewed = await Review.exists({
      product: productId,
      'customer.userId': req.user._id,
    });
    if (alreadyReviewed) {
      return errorResponse(res, 'You have already reviewed this product', 409);
    }

    const review = await Review.create({
      product: productId,
      seller: product.seller.userId,
      customer: { userId: req.user._id, name: req.user.fullName || 'Customer' },
      rating,
      comment: String(req.body.comment || '').trim(),
    });

    const productRating = await aggregateRating({ product: new mongoose.Types.ObjectId(productId) });
    await Product.findByIdAndUpdate(productId, {
      ratingAverage: productRating.avg,
      ratingCount: productRating.count,
    });

    const sellerRating = await aggregateRating({ seller: new mongoose.Types.ObjectId(product.seller.userId) });
    await User.findByIdAndUpdate(product.seller.userId, {
      rating: sellerRating.avg,
      totalReviews: sellerRating.count,
    });

    return successResponse(
      res,
      'Review submitted',
      { review: toApi(review), summary: { average: productRating.avg, count: productRating.count } },
      201
    );
  } catch (err) {
    if (err && err.code === 11000) {
      return errorResponse(res, 'You have already reviewed this product', 409);
    }
    next(err);
  }
};

module.exports = { listProductReviews, createProductReview };
