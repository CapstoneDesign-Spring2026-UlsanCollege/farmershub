const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        : {
          : [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      { : { createdAt: -1 } },
      {
        : {
          _id: {
            : [
              { : ['', new mongoose.Types.ObjectId(userId)] },
              '',
              ''
            ]
          },
          lastMessage: { : '' },
          lastMessageTime: { : '' }
        }
      }
    ]);

    const populated = await User.populate(conversations, {
      path: '_id',
      select: 'fullName role farmName avatar'
    });

    return successResponse(res, 'Conversations fetched', populated);
  } catch (err) {
    next(err);
  }
};

module.exports = { getConversations };
