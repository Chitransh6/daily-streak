const m = require('mongoose');
// One doc per user = current cycle. Claims advance it with a conditional atomic update.
module.exports = m.model('StreakState', new m.Schema({
  userId: { type: m.Types.ObjectId, ref: 'User', unique: true },
  cycleNo: { type: Number, default: 1 },
  lastDay: { type: Number, default: 0 },
  lastClaimAt: { type: Date, default: null },
  status: { type: String, default: 'ACTIVE' },
  missedDay: { type: Number, default: null }, // day the user missed before the reset // ACTIVE | COMPLETED | RESET
}, { timestamps: true }));
