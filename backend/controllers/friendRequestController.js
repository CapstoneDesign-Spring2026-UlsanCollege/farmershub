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
    const notification = await Notification.findById(friendRequest.notification);
    if (notification) {
      notification.read = false;
      notification.title = 'New friend request';
      notification.body = `${requester.fullName} sent you a friend request.`;
      notification.relatedId = requester._id;
      notification.relatedModel = 'User';
      await notification.save();
      return notification;
    }
  }

  const existingNotification = await Notification.findOne({
    user: recipientId,
    type: 'friend_request',
    relatedId: requester._id,
    relatedModel: 'User',
    read: false,
  }).sort({ createdAt: -1 });

  if (existingNotification) {
    existingNotification.read = false;
    existingNotification.title = 'New friend request';
    existingNotification.body = `${requester.fullName} sent you a friend request.`;
    await existingNotification.save();
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

    const recipient = await User.findOne({ _id: recipientId, isActive: true }).select('_id fullName friends');
    if (!recipient) {
      return errorResponse(res, 'Recipient user not found.', 404);
    }

    // Fix before merging to main: do not create another request when users are already friends.
    const alreadyFriends = await User.exists({
      _id: requesterId,
      friends: recipientId,
    });

    if (alreadyFriends) {
      return errorResponse(res, 'You are already friends with this user.', 409);
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


// Fix before merging to main: allow the recipient to accept a pending request and save friendship both ways.
async function acceptFriendRequest(req, res, next) {
  try {
    const friendRequest = await FriendRequest.findOne({
      _id: req.params.id,
      recipient: req.user._id,
      status: 'pending',
    });

    if (!friendRequest) {
      return errorResponse(res, 'Pending friend request not found.', 404);
    }

    friendRequest.status = 'accepted';
    await friendRequest.save();

    await Promise.all([
      User.findByIdAndUpdate(friendRequest.requester, { $addToSet: { friends: friendRequest.recipient } }),
      User.findByIdAndUpdate(friendRequest.recipient, { $addToSet: { friends: friendRequest.requester } }),
      createNotification(
        friendRequest.requester,
        'friend_request',
        'Friend request accepted',
        `${req.user.fullName} accepted your friend request.`,
        req.user._id,
        'User'
      ),
    ]);

    return successResponse(res, 'Friend request accepted.', {
      friendRequest: serializeFriendRequest(friendRequest),
    });
  } catch (err) {
    next(err);
  }
}

// Fix before merging to main: allow the recipient to decline a pending request.
async function declineFriendRequest(req, res, next) {
  try {
    const friendRequest = await FriendRequest.findOne({
      _id: req.params.id,
      recipient: req.user._id,
      status: 'pending',
    });

    if (!friendRequest) {
      return errorResponse(res, 'Pending friend request not found.', 404);
    }

    friendRequest.status = 'declined';
    await friendRequest.save();

    return successResponse(res, 'Friend request declined.', {
      friendRequest: serializeFriendRequest(friendRequest),
    });
  } catch (err) {
    next(err);
  }
}

// Fix before merging to main: allow the sender to cancel their own pending request.
async function cancelFriendRequest(req, res, next) {
  try {
    const friendRequest = await FriendRequest.findOne({
      _id: req.params.id,
      requester: req.user._id,
      status: 'pending',
    });

    if (!friendRequest) {
      return errorResponse(res, 'Pending friend request not found.', 404);
    }

    friendRequest.status = 'cancelled';
    await friendRequest.save();

    return successResponse(res, 'Friend request cancelled.', {
      friendRequest: serializeFriendRequest(friendRequest),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
};
