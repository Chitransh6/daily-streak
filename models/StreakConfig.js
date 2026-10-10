const m = require('mongoose');
module.exports = m.model('StreakConfig', new m.Schema({
  key: { type: String, default: 'default', unique: true },
  claimIntervalHours: { type: Number, default: 24 }, // wait between claims
  claimWindowHours: { type: Number, default: 24 },   // after unlock, miss this window => reset
}));
