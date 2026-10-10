const m = require('mongoose');
module.exports = m.model('WalletTransaction', new m.Schema({
  userId: m.Types.ObjectId, rewardType: String, currency: String, type: { type: String, default: 'CREDIT' },
  amount: Number, source: { type: String, default: 'DAILY_STREAK' }, streakDay: Number,
  referenceId: { type: String, unique: true }, balanceBefore: Number, balanceAfter: Number,
  status: String, // COMPLETED | PENDING_FULFILLMENT (gift cards)
}, { timestamps: true }));
