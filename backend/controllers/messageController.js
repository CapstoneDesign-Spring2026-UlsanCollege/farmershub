const Message = require('../models/Message');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * GET /api/messages
 * Get all messages for the authenticated user (conversations).
 */
const getUserMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender', 'fullName role')
      .populate('receiver', 'fullName role')
      .sort({ createdAt: -1 });

    // Group messages by conversation (other user)
    const conversations = {};
    messages.forEach((message) => {
      const otherUserId = message.sender._id.toString() === req.user._id.toString()
        ? message.receiver._id.toString()
        : message.sender._id.toString();

      if (!conversations[otherUserId]) {
        const otherUser = message.sender._id.toString() === req.user._id.toString()
          ? message.receiver
          : message.sender;
        conversations[otherUserId] = {
          user: otherUser,
          messages: [],
          unreadCount: 0,
          lastMessage: message,
        };
      }

      conversations[otherUserId].messages.push(message);
      if (!message.isRead && message.receiver._id.toString() === req.user._id.toString()) {
        conversations[otherUserId].unreadCount++;
      }
    });

    const conversationList = Object.values(conversations);
    return successResponse(res, 'Messages retrieved', conversationList);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/messages
 * Send a new message.
 */
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, relatedProduct } = req.body;
    const cleanContent = String(content || '').trim();

    if (!receiverId || !cleanContent) {
      return errorResponse(res, 'Receiver and content are required', 400);
    }

    if (String(receiverId) === String(req.user._id)) {
      return errorResponse(res, 'You cannot message yourself', 400);
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return errorResponse(res, 'Receiver not found', 404);
    }

    // Create the message
    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content: cleanContent,
      relatedProduct,
    });

    await message.save();
    await message.populate('sender', 'fullName role');
    await message.populate('receiver', 'fullName role');

    // Create notification for the receiver
    const truncatedContent = cleanContent.length > 50 ? cleanContent.substring(0, 50) + '...' : cleanContent;
    await createNotification(
      receiverId,
      'message',
      `New message from ${req.user.fullName}`,
      truncatedContent,
      message._id,
      'Message'
    );

    return successResponse(res, 'Message sent', message, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/messages/:id/read
 * Mark a message as read.
 */
const markMessageAsRead = async (req, res, next) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, receiver: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return errorResponse(res, 'Message not found', 404);
    }

    return successResponse(res, 'Message marked as read', message);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserMessages,
  sendMessage,
  markMessageAsRead,
};
