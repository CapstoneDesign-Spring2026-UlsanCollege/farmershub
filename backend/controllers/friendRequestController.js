const mongoose = require('mongoose');
const FriendRequest = require('../models/FriendRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { successResponse, errorResponse } = require('../utils/apiResponse');

function serializeFriendRequest(friendRequest) {
  return {
    id: String(friendRequest._id),
    requester: String(friendRequest.requester?._id || friendRequest.requester),
    recipient: String(friendRequest.recipient?._id || friendRequest.recipient),
    status: friendRequest.status,
    notification: friendRequest.notification ? String(friendRequest.notification) : null,
    createdAt: friendRequest.createdAt,
    updatedAt: friendRequest.updatedAt,
  };
}

async function ensureFriendRequestNotification(friendRequest, requester, recipientId) {
  if (friendRequest.notification) {
    return Notification.findById(friendRequest.notification);
  }

  const existingNotification = await Notification.findOne({
    user: recipientId,
    type: 'friend_request',
    relatedId: requester._id,
    relatedModel: 'User',
    read: false,
  }).sort({ createdAt: -1 });

  if (existingNotification) {
    friendRequest.notification = existingNotification._id;
    await friendRequest.save();
    return existingNotification;
  }

  const notification = await createNotification(
    recipientId,
    'friend_request',
    'New friend request',
    `${requester.fullName} sent you a friend request.`,
    requester._id,
    'User'
  );

  friendRequest.notification = notification._id;
  await friendRequest.save();
  return notification;
}

async function sendFriendRequest(req, res, next) {
  try {
    const requesterId = req.user._id;
    const { recipientId } = req.body || {};

    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return errorResponse(res, 'A valid recipientId is required.', 400);
    }

    if (String(requesterId) === String(recipientId)) {
      return errorResponse(res, 'You cannot send a friend request to yourself.', 400);
    }

    const recipient = await User.findOne({ _id: recipientId, isActive: true }).select('_id fullName');
    if (!recipient) {
      return errorResponse(res, 'Recipient user not found.', 404);
    }

    let friendRequest = await FriendRequest.findOne({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending',
    });

    let created = false;
    if (!friendRequest) {
      try {
        friendRequest = await FriendRequest.create({
          requester: requesterId,
          recipient: recipientId,
          status: 'pending',
        });
        created = true;
      } catch (error) {
        if (error.code !== 11000) throw error;
        friendRequest = await FriendRequest.findOne({
          requester: requesterId,
          recipient: recipientId,
          status: 'pending',
        });
      }
    }

    const notification = await ensureFriendRequestNotification(friendRequest, req.user, recipientId);

    return successResponse(
      res,
      created ? 'Friend request sent.' : 'Friend request already pending.',
      {
        friendRequest: serializeFriendRequest(friendRequest),
        notification: notification
          ? {
              id: String(notification._id),
              type: notification.type,
              title: notification.title,
              body: notification.body,
            }
          : null,
      },
      created ? 201 : 200
    );
  } catch (err) {
    next(err);
  }
}

async function getFriendRequests(req, res, next) {
  try {
    const [received, sent] = await Promise.all([
      FriendRequest.find({ recipient: req.user._id, status: 'pending' })
        .sort({ createdAt: -1 })
        .populate('requester', 'fullName role email'),
      FriendRequest.find({ requester: req.user._id, status: 'pending' })
        .sort({ createdAt: -1 })
        .populate('recipient', 'fullName role email'),
    ]);

    return successResponse(res, 'Friend requests retrieved.', {
      received: received.map(serializeFriendRequest),
      sent: sent.map(serializeFriendRequest),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  sendFriendRequest,
  getFriendRequests,
};
