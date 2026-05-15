const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * GET /api/notifications
 * Returns paginated notifications for the authenticated user.
 */
const getUserNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'fullName')
      .populate('relatedId');

    const messageNotifications = notifications.filter(
      (notification) => notification.relatedModel === 'Message' && notification.relatedId
    );
    await Notification.populate(messageNotifications, [
      { path: 'relatedId.sender', select: 'fullName role' },
      { path: 'relatedId.receiver', select: 'fullName role' },
    ]);

    const total = await Notification.countDocuments({ user: req.user._id });

    return successResponse(res, 'Notifications retrieved', {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/notifications/:id/read
 * Marks a specific notification as read.
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    return successResponse(res, 'Notification marked as read', notification);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/notifications/read-all
 * Marks all notifications for the authenticated user as read.
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    return successResponse(res, 'All notifications marked as read', {
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Internal function to create a notification.
 * @param {string} userId - User ID to receive the notification
 * @param {string} type - Notification type (order, message, market, system)
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {string} [relatedId] - Optional related document ID
 * @param {string} [relatedModel] - Optional related model name
 */
const createNotification = async (userId, type, title, body, relatedId = null, relatedModel = null) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      body,
      relatedId,
      relatedModel,
    });

    await notification.save();
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
};
