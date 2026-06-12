const { Order, ORDER_STATUSES } = require('../models/Order');
const { successResponse } = require('../utils/apiResponse');

function serializeOrder(order) {
  return {
    id: String(order._id),
    orderNumber: order.orderNumber,
    product: order.product,
    farmer: order.farmer,
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

module.exports = { getMyOrders };
