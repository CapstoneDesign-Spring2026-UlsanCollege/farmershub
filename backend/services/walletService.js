const crypto = require('crypto');
const User = require('../models/User');
const { WalletTransaction } = require('../models/WalletTransaction');

/**
 * Error thrown when an account does not have enough virtual money for a debit.
 * Carries statusCode 400 so the central error handler returns a clean message.
 */
class InsufficientFundsError extends Error {
  constructor(message = 'Insufficient wallet balance') {
    super(message);
    this.name = 'InsufficientFundsError';
    this.statusCode = 400;
  }
}

function normalizeAmount(amount) {
  const value = Math.round(Number(amount));
  if (!Number.isFinite(value) || value <= 0) {
    const err = new Error('Amount must be a positive whole number of won');
    err.statusCode = 400;
    throw err;
  }
  return value;
}

function counterpartyFrom(user) {
  if (!user) return undefined;
  return {
    userId: user._id || user.id,
    name: user.fullName || user.farmName || '',
    role: user.role || '',
  };
}

/**
 * Credit an account and append a ledger entry. Atomic on the balance field.
 */
async function credit(userId, amount, meta = {}) {
  const value = normalizeAmount(amount);
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: value } },
    { new: true }
  );
  if (!user) {
    const err = new Error('Wallet owner not found');
    err.statusCode = 404;
    throw err;
  }

  const tx = await WalletTransaction.create({
    user: user._id,
    direction: 'credit',
    amount: value,
    balanceAfter: user.walletBalance,
    type: meta.type || 'adjustment',
    description: meta.description || '',
    counterparty: meta.counterparty,
    transferId: meta.transferId || '',
    relatedId: meta.relatedId,
    relatedModel: meta.relatedModel,
  });

  return { user, transaction: tx };
}

/**
 * Debit an account only if it has sufficient funds. Throws InsufficientFundsError
 * otherwise. The conditional update guarantees the balance never goes negative.
 */
async function debit(userId, amount, meta = {}) {
  const value = normalizeAmount(amount);
  const user = await User.findOneAndUpdate(
    { _id: userId, walletBalance: { $gte: value } },
    { $inc: { walletBalance: -value } },
    { new: true }
  );
  if (!user) {
    const exists = await User.exists({ _id: userId });
    if (!exists) {
      const err = new Error('Wallet owner not found');
      err.statusCode = 404;
      throw err;
    }
    throw new InsufficientFundsError(meta.insufficientMessage || 'Insufficient wallet balance');
  }

  const tx = await WalletTransaction.create({
    user: user._id,
    direction: 'debit',
    amount: value,
    balanceAfter: user.walletBalance,
    type: meta.type || 'adjustment',
    description: meta.description || '',
    counterparty: meta.counterparty,
    transferId: meta.transferId || '',
    relatedId: meta.relatedId,
    relatedModel: meta.relatedModel,
  });

  return { user, transaction: tx };
}

/**
 * Move money from one account to another, recording both sides of the transfer.
 * If crediting the payee fails, the payer is automatically refunded.
 */
async function transfer(fromUserId, toUserId, amount, meta = {}) {
  const value = normalizeAmount(amount);
  const transferId = meta.transferId || crypto.randomUUID();

  const fromResult = await debit(fromUserId, value, {
    type: meta.type,
    description: meta.debitDescription || meta.description || '',
    counterparty: meta.toCounterparty,
    transferId,
    relatedId: meta.relatedId,
    relatedModel: meta.relatedModel,
    insufficientMessage: meta.insufficientMessage,
  });

  try {
    const toResult = await credit(toUserId, value, {
      type: meta.type,
      description: meta.creditDescription || meta.description || '',
      counterparty: meta.fromCounterparty,
      transferId,
      relatedId: meta.relatedId,
      relatedModel: meta.relatedModel,
    });
    return { transferId, from: fromResult, to: toResult };
  } catch (err) {
    // Roll the payer back so money is never lost if the credit half fails.
    await credit(fromUserId, value, {
      type: 'adjustment',
      description: 'Auto-refund: transfer could not be completed',
      transferId,
    }).catch(() => {});
    throw err;
  }
}

module.exports = {
  credit,
  debit,
  transfer,
  counterpartyFrom,
  normalizeAmount,
  InsufficientFundsError,
};
