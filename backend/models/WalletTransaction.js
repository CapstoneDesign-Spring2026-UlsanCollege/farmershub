const mongoose = require('mongoose');

// Categories of money movement, used for labelling and filtering the ledger.
const TX_TYPES = ['recharge', 'order_payment', 'order_refund', 'delivery_fee', 'adjustment'];

/**
 * Immutable ledger entry. A transfer between two accounts produces two entries
 * (a debit for the payer and a credit for the payee) sharing the same `transferId`.
 */
const walletTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    direction: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    amount: {
      // Korean won, always a positive integer.
      type: Number,
      required: true,
      min: 1,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: TX_TYPES,
      required: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 200,
    },
    // The other side of a transfer, if any.
    counterparty: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '', trim: true },
      role: { type: String, default: '', trim: true },
    },
    // Groups the two ledger entries that make up a single transfer.
    transferId: { type: String, default: '', trim: true, index: true },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedModel',
    },
    relatedModel: {
      type: String,
      enum: ['Order', 'RechargeRequest', 'DeliveryPartner'],
    },
  },
  { timestamps: true }
);

walletTransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = {
  WalletTransaction: mongoose.model('WalletTransaction', walletTransactionSchema),
  TX_TYPES,
};
