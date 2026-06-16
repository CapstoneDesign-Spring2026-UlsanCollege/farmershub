const { Order, ORDER_STATUSES } = require('../models/Order');
const Product = require('../models/Product');
const { DeliveryPartner } = require('../models/DeliveryPartner');
const walletService = require('../services/walletService');
const { createNotification } = require('./notificationController');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Reverse an order's wallet payment and restore reserved stock. Best-effort:
 * if the farmer has already spent the money, the customer is still made whole.
 * Returns true if a refund was performed.
 */
async function refundOrder(order) {
  if (order.paymentStatus !== 'paid') return false;

  try {
    await walletService.transfer(order.farmer.userId, order.customer.userId, order.totalAmount, {
      type: 'order_refund',
      debitDescription: `Refund for cancelled order ${order.orderNumber}`,
      creditDescription: `Refund for cancelled order ${order.orderNumber}`,
      relatedId: order._id,
      relatedModel: 'Order',
    });
  } catch (err) {
    await walletService.credit(order.customer.userId, order.totalAmount, {
      type: 'order_refund',
      description: `Refund for cancelled order ${order.orderNumber}`,
      relatedId: order._id,
      relatedModel: 'Order',
    });
  }

  order.paymentStatus = 'refunded';
  await Product.updateOne({ _id: order.product.productId }, { $inc: { stock: order.quantity } }).catch(() => {});
  return true;
}

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
    paymentStatus: order.paymentStatus,
    delivery: order.delivery && order.delivery.partnerName ? {
      partnerName: order.delivery.partnerName,
      providerName: order.delivery.providerName,
      fee: order.delivery.fee,
      assignedAt: order.delivery.assignedAt,
    } : null,
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

    let refunded = false;
    if (status === 'cancelled') {
      refunded = await refundOrder(order);
    }

    order.status = status;
    order.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: String(note || '').trim(),
      changedAt: new Date(),
    });
    await order.save();

    if (refunded) {
      try {
        await createNotification(
          order.customer.userId,
          'wallet',
          'Order refunded',
          `${order.totalAmount.toLocaleString()} won has been refunded for order ${order.orderNumber}.`,
          order._id,
          'Order'
        );
      } catch {
        // A failed notification must not roll back the refund.
      }
    }

    return successResponse(res, 'Order status updated.', { order: serializeOrder(order) });
  } catch (err) {
    next(err);
  }
}

// PUT /api/orders/:id/delivery — farmer ships an order by assigning a delivery partner.
// The flat delivery fee moves from the farmer's wallet to the provider's.
async function assignDelivery(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return errorResponse(res, 'Order not found.', 404);

    if (String(order.farmer.userId) !== String(req.user._id)) {
      return errorResponse(res, 'Not authorized to ship this order.', 403);
    }
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return errorResponse(res, `Order is already ${order.status}.`, 409);
    }

    const partner = await DeliveryPartner.findOne({ _id: req.body.partnerId, isActive: true });
    if (!partner) {
      return errorResponse(res, 'Selected delivery partner is unavailable.', 404);
    }

    // Pay the provider their flat delivery fee, if any.
    if (partner.fee > 0) {
      try {
        await walletService.transfer(req.user._id, partner.provider, partner.fee, {
          type: 'delivery_fee',
          debitDescription: `Delivery fee — ${partner.name} (order ${order.orderNumber})`,
          creditDescription: `Delivery fee — ${partner.name} (order ${order.orderNumber})`,
          fromCounterparty: walletService.counterpartyFrom(req.user),
          toCounterparty: { userId: partner.provider, name: partner.providerName, role: 'provider' },
          relatedId: partner._id,
          relatedModel: 'DeliveryPartner',
          insufficientMessage: 'Your wallet balance is too low to pay this delivery fee. Recharge and try again.',
        });
      } catch (error) {
        if (error.statusCode === 400) return errorResponse(res, error.message, 400);
        throw error;
      }
    }

    order.delivery = {
      partnerId: partner._id,
      providerId: partner.provider,
      providerName: partner.providerName,
      partnerName: partner.name,
      fee: partner.fee,
      assignedAt: new Date(),
    };
    order.status = 'shipped';
    order.statusHistory.push({
      status: 'shipped',
      changedBy: req.user._id,
      note: `Shipped via ${partner.name}`,
      changedAt: new Date(),
    });
    await order.save();

    try {
      await createNotification(
        partner.provider,
        'wallet',
        'New delivery job',
        `${req.user.fullName || 'A farmer'} assigned "${partner.name}" to deliver order ${order.orderNumber}.${partner.fee > 0 ? ` You earned ${partner.fee.toLocaleString()} won.` : ''}`,
        order._id,
        'Order'
      );
      await createNotification(
        order.customer.userId,
        'order',
        'Order shipped',
        `Order ${order.orderNumber} is on its way via ${partner.name}.`,
        order._id,
        'Order'
      );
    } catch {
      // Notification failures must not undo a completed shipment.
    }

    return successResponse(res, 'Delivery partner assigned and order shipped.', { order: serializeOrder(order) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyOrders, getOrders, updateOrderStatus, assignDelivery, refundOrder };
