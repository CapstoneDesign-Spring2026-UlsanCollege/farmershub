const express = require('express');
const mongoose = require('mongoose');

const Message = require('../models/Message');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const router = express.Router();

router.use(requireAuth);

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function userSummary(user) {
  if (!user) return null;
  return {
    id: String(user._id),
    fullName: user.fullName,
    role: user.role,
    farmName: user.farmName || '',
    location: user.farmLocation || user.address || '',
    avatarUrl: user.avatar?.url || '',
  };
}

function getConversationKey(userA, userB) {
  return [String(userA), String(userB)].sort().join(':');
}

// GET /api/messages/conversations
router.get('/conversations', async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId },
        { receiver: currentUserId },
      ],
    })
      .populate('sender', 'fullName role farmName farmLocation address avatar')
      .populate('receiver', 'fullName role farmName farmLocation address avatar')
      .sort({ createdAt: -1 });

    const conversations = new Map();

    messages.forEach((message) => {
      const senderId = String(message.sender?._id || message.sender);
      const receiverId = String(message.receiver?._id || message.receiver);
      const otherUser = senderId === currentUserId ? message.receiver : message.sender;
      const otherUserId = String(otherUser?._id || otherUser);
      const key = getConversationKey(currentUserId, otherUserId);

      if (!conversations.has(key)) {
        conversations.set(key, {
          id: key,
          participant: userSummary(otherUser),
          lastMessage: {
            id: String(message._id),
            content: message.content,
            sender: senderId,
            receiver: receiverId,
            createdAt: message.createdAt,
            isRead: message.isRead,
          },
          unreadCount: 0,
          updatedAt: message.createdAt,
        });
      }

      if (receiverId === currentUserId && !message.isRead) {
        conversations.get(key).unreadCount += 1;
      }
    });

    return successResponse(res, 'Conversations loaded.', Array.from(conversations.values()));
  } catch (error) {
    return next(error);
  }
});

// GET /api/messages/:conversationId
router.get('/:conversationId', async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = String(req.params.conversationId).split(':').find((id) => id !== currentUserId);

    if (!otherUserId || !isValidObjectId(otherUserId)) {
      return errorResponse(res, 'Invalid conversation id.', 400);
    }

    const otherUser = await User.findById(otherUserId).select('fullName role farmName farmLocation address avatar');
    if (!otherUser) {
      return errorResponse(res, 'Conversation user not found.', 404);
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'fullName role')
      .populate('receiver', 'fullName role');

    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    return successResponse(res, 'Messages loaded.', {
      conversationId: getConversationKey(currentUserId, otherUserId),
      participant: userSummary(otherUser),
      messages: messages.map((message) => ({
        id: String(message._id),
        content: message.content,
        sender: String(message.sender?._id || message.sender),
        receiver: String(message.receiver?._id || message.receiver),
        createdAt: message.createdAt,
        isMine: String(message.sender?._id || message.sender) === currentUserId,
      })),
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/messages/start
router.post('/start', async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { receiverId, content, relatedProduct } = req.body;

    if (!receiverId || !isValidObjectId(receiverId)) {
      return errorResponse(res, 'Valid receiverId is required.', 400);
    }

    if (String(receiverId) === currentUserId) {
      return errorResponse(res, 'You cannot message yourself.', 400);
    }

    const receiver = await User.findById(receiverId).select('fullName role farmName farmLocation address avatar');
    if (!receiver) {
      return errorResponse(res, 'Receiver not found.', 404);
    }

    const cleanContent = String(content || '').trim();
    if (!cleanContent) {
      return errorResponse(res, 'Message content is required.', 400);
    }

    const message = await Message.create({
      sender: currentUserId,
      receiver: receiverId,
      content: cleanContent,
      relatedProduct: relatedProduct || undefined,
    });

    return successResponse(res, 'Conversation started.', {
      conversationId: getConversationKey(currentUserId, receiverId),
      participant: userSummary(receiver),
      message: {
        id: String(message._id),
        content: message.content,
        sender: String(message.sender),
        receiver: String(message.receiver),
        createdAt: message.createdAt,
        isMine: true,
      },
    }, 201);
  } catch (error) {
    return next(error);
  }
});

// POST /api/messages/:conversationId
router.post('/:conversationId', async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = String(req.params.conversationId).split(':').find((id) => id !== currentUserId);

    if (!otherUserId || !isValidObjectId(otherUserId)) {
      return errorResponse(res, 'Invalid conversation id.', 400);
    }

    const receiver = await User.findById(otherUserId).select('_id');
    if (!receiver) {
      return errorResponse(res, 'Receiver not found.', 404);
    }

    const cleanContent = String(req.body.content || '').trim();
    if (!cleanContent) {
      return errorResponse(res, 'Message content is required.', 400);
    }

    const message = await Message.create({
      sender: currentUserId,
      receiver: otherUserId,
      content: cleanContent,
    });

    return successResponse(res, 'Message sent.', {
      id: String(message._id),
      content: message.content,
      sender: String(message.sender),
      receiver: String(message.receiver),
      createdAt: message.createdAt,
      isMine: true,
    }, 201);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
