const { Order, ORDER_STATUSES } = require('../models/Order');
const { successResponse, errorResponse } = require('../utils/apiResponse');

function serializeOrder(order) {
  return {
    id: String(order._id),
    orderNumber: order.orderNumber,
    product: {
      productId: String(order.product.productId),
      name: order.product.name,
      unit: order.product.unit,
      unitPrice: order.product.unitPrice,
    },
    customer: {
      userId: String(order.customer.userId),
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone,
    },
    farmer: {
      userId: String(order.farmer.userId),
      name: order.farmer.name,
      email: order.farmer.email,
      phone: order.farmer.phone,
    },
    quantity: order.quantity,
    totalAmount: order.totalAmount,
    notes: order.notes,
    status: order.status,
    statusHistory: (order.statusHistory || []).map((item) => ({
      status: item.status,
      note: item.note,
      changedAt: item.changedAt,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

// GET /api/orders/my — customer's own orders
async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ 'customer.userId': req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 'Customer orders retrieved', {
      orders: orders.map(serializeOrder),
      statuses: ORDER_STATUSES,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders — farmer sees received orders, customer sees placed orders
async function getOrders(req, res, next) {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const skip = (pageNumber - 1) * pageSize;

    const query = {};
    if (req.user.role === 'farmer') {
      query['farmer.userId'] = req.user._id;
    } else if (req.user.role === 'customer') {
      query['customer.userId'] = req.user._id;
    }
    if (status && ORDER_STATUSES.includes(status)) {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      Order.countDocuments(query),
    ]);

    return successResponse(res, 'Orders retrieved.', {
      orders: orders.map(serializeOrder),
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status, note } = req.body;

    if (!status || !ORDER_STATUSES.includes(status)) {
      return errorResponse(res, `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`, 400);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return errorResponse(res, 'Order not found.', 404);
    }

    if (req.user.role !== 'admin' && String(order.farmer.userId) !== String(req.user._id)) {
      return errorResponse(res, 'Not authorized to update this order.', 403);
    }

    order.status = status;
    order.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: String(note || '').trim(),
      changedAt: new Date(),
    });
    await order.save();

    return successResponse(res, 'Order status updated.', { order: serializeOrder(order) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyOrders, getOrders, updateOrderStatus };
