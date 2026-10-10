require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const StreakConfig = require('../models/StreakConfig');
const StreakReward = require('../models/StreakReward');
const R = (day, rewardType, currency, amount, title, subtitle, assetType, badge) => ({ day, rewardType, currency, amount, title, subtitle, assetType, badge, active: true });
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await StreakReward.deleteMany({}); await StreakConfig.deleteMany({});
  await StreakConfig.create({ key: 'default', claimIntervalHours: 24, claimWindowHours: 24 });
  await StreakReward.insertMany([
    R(1, 'VES', 'VES', 5, 'Daily Reward', '5 VEs', 'coin'),
    R(2, 'VES', 'VES', 10, 'Daily Reward', '10 VEs', 'coin'),
    R(3, 'VES', 'VES', 15, 'Daily Reward', '15 VEs', 'coin'),
    R(4, 'GIFT_CARD', 'INR', 1, 'Daily Reward', 'Amazon Gift Card', 'gift'),
    R(5, 'GIFT_CARD', 'INR', 2, 'Daily Reward', 'Amazon Gift Card', 'gift-card', 'Gift Card'),
    R(6, 'VES', 'VES', 30, 'Daily Reward', '30 VEs', 'coin', 'Coin'),
    R(7, 'GIFT_CARD', 'INR', 5, 'Ultimate Reward', 'Amazon Gift Card', 'crown', 'VIP'),
  ]);
  await User.findOneAndUpdate({ email: 'demo@veloop.in' },
    { name: 'Demo User', passwordHash: await bcrypt.hash('Demo@123', 10), 'wallet.VES': 120 }, { upsert: true });
  console.log('Seeded. Login: demo@veloop.in / Demo@123');
  process.exit(0);
})();
