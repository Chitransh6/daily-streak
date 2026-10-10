const m = require('mongoose');
module.exports = m.model('StreakReward', new m.Schema({
  day: { type: Number, unique: true }, rewardType: String, currency: String, amount: Number,
  title: String, subtitle: String, assetType: String, badge: String,
  active: { type: Boolean, default: true }, metadata: Object,
}));
