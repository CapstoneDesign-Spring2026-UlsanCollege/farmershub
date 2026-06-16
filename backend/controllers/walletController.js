const { WalletTransaction } = require('../models/WalletTransaction');
const { RechargeRequest, MAX_RECHARGE_WON } = require('../models/RechargeRequest');
const { successResponse, errorResponse } = require('../utils/apiResponse');

function serializeTransaction(tx) {
  return {
    id: String(tx._id),
    direction: tx.direction,
    amount: tx.amount,
    balanceAfter: tx.balanceAfter,
    type: tx.type,
    description: tx.description,
    counterparty: tx.counterparty
      ? { name: tx.counterparty.name, role: tx.counterparty.role }
      : null,
    createdAt: tx.createdAt,
  };
}

function serializeRecharge(request) {
  return {
    id: String(request._id),
    amount: request.amount,
    status: request.status,
    note: request.note,
    reviewNote: request.reviewNote,
    reviewedAt: request.reviewedAt,
    requesterName: request.requesterName,
    requesterRole: request.requesterRole,
    createdAt: request.createdAt,
  };
}

// GET /api/wallet — current balance + recent ledger entries for the signed-in user.
async function getWallet(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const transactions = await WalletTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return successResponse(res, 'Wallet retrieved', {
      balance: req.user.walletBalance || 0,
      maxRecharge: MAX_RECHARGE_WON,
      transactions: transactions.map(serializeTransaction),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/wallet/recharge-requests — ask the admin to top up the wallet.
async function createRechargeRequest(req, res, next) {
  try {
    const amount = Math.round(Number(req.body.amount));
    if (!Number.isFinite(amount) || amount <= 0) {
      return errorResponse(res, 'Recharge amount must be a positive number of won', 400);
    }
    if (amount > MAX_RECHARGE_WON) {
      return errorResponse(res, `Maximum recharge is ${MAX_RECHARGE_WON.toLocaleString()} won at a time`, 400);
    }

    const existingPending = await RechargeRequest.countDocuments({
      requester: req.user._id,
      status: 'pending',
    });
    if (existingPending >= 5) {
      return errorResponse(res, 'You already have several recharge requests awaiting review', 400);
    }

    const request = await RechargeRequest.create({
      requester: req.user._id,
      requesterName: req.user.fullName || req.user.farmName || '',
      requesterRole: req.user.role,
      amount,
      note: String(req.body.note || '').trim().slice(0, 300),
    });

    return successResponse(res, 'Recharge request sent to the administrator', {
      request: serializeRecharge(request),
    }, 201);
  } catch (err) {
    next(err);
  }
}

// GET /api/wallet/recharge-requests — the signed-in user's own requests.
async function getMyRechargeRequests(req, res, next) {
  try {
    const requests = await RechargeRequest.find({ requester: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return successResponse(res, 'Recharge requests retrieved', {
      requests: requests.map(serializeRecharge),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getWallet,
  createRechargeRequest,
  getMyRechargeRequests,
  serializeTransaction,
  serializeRecharge,
};
