const m = require('mongoose');
const s = new m.Schema({
  userId: m.Types.ObjectId, cycleNo: Number, day: Number, rewardId: m.Types.ObjectId,
  referenceId: String, transactionId: m.Types.ObjectId, status: { type: String, default: 'CLAIMED' },
  claimedAt: Date,
}, { timestamps: true });
s.index({ userId: 1, cycleNo: 1, day: 1 }, { unique: true }); // duplicate-claim guard
module.exports = m.model('StreakClaim', s);
