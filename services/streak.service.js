const crypto = require('crypto');
const User = require('../models/User');
const StreakConfig = require('../models/StreakConfig');
const StreakReward = require('../models/StreakReward');
const StreakState = require('../models/StreakState');
const StreakClaim = require('../models/StreakClaim');
const WalletTransaction = require('../models/WalletTransaction');
const AuditLog = require('../models/AuditLog');

class AppError extends Error {
  constructor(status, code, message, extra) { super(message); Object.assign(this, { status, code, extra }); }
}
const audit = (userId, event, meta, ip) => AuditLog.create({ userId, event, meta, ip }).catch(() => {});

async function getOrCreateState(userId) {
  try {
    return await StreakState.findOneAndUpdate({ userId }, { $setOnInsert: { userId } }, { upsert: true, new: true });
  } catch (e) { if (e.code === 11000) return StreakState.findOne({ userId }); throw e; }
}

// Pure rule engine: all streak decisions use server time (ms) + DB config.
function compute(st, cfg, total, now) {
  const iv = cfg.claimIntervalHours * 36e5, win = cfg.claimWindowHours * 36e5;
  const last = st.lastClaimAt ? +st.lastClaimAt : null;
  let lastDay = st.lastDay, expired = null;
  if (last && lastDay > 0) {
    if (lastDay >= total && now >= last + iv) expired = 'CYCLE_DONE';
    else if (lastDay < total && now > last + iv + win) expired = 'MISSED';
  }
  if (expired) lastDay = 0;
  const nextDay = lastDay >= total ? 1 : lastDay + 1;
  const nextClaimAt = lastDay > 0 ? new Date(last + iv) : null;
  const canClaim = lastDay < total && (!nextClaimAt || now >= +nextClaimAt);
  return { lastDay, expired, nextDay, nextClaimAt, canClaim };
}

async function load(userId) {
  const now = Date.now();
  const [cfg, rewards] = await Promise.all([
    StreakConfig.findOne({ key: 'default' }).lean(),
    StreakReward.find({ active: true }).sort({ day: 1 }).lean(),
  ]);
  let st = await getOrCreateState(userId);
  let c = compute(st, cfg, rewards.length, now);
  if (c.expired) { // persist reset on the server, not the browser
    const n = await StreakState.findOneAndUpdate(
      { _id: st._id, cycleNo: st.cycleNo, lastClaimAt: st.lastClaimAt },
      { $set: { lastDay: 0, lastClaimAt: null, status: c.expired === 'MISSED' ? 'RESET' : 'ACTIVE', missedDay: c.expired === 'MISSED' ? st.lastDay + 1 : null }, $inc: { cycleNo: 1 } },
      { new: true });
    if (n && c.expired === 'MISSED') await audit(userId, 'STREAK_RESET', { previousDay: st.lastDay });
    st = n || (await StreakState.findOne({ userId }));
    c = compute(st, cfg, rewards.length, now);
  }
  return { st, cfg, rewards, now, ...c };
}

const pub = (r) => r && ({ type: r.rewardType, currency: r.currency, amount: r.amount, title: r.title, subtitle: r.subtitle, assetType: r.assetType, badge: r.badge });

async function getStreak(userId) {
  const c = await load(userId);
  const total = c.rewards.length, user = await User.findById(userId).lean();
  const nextReward = c.rewards.find((r) => r.day === c.nextDay);
  const missed = c.st.status === 'RESET' && c.lastDay === 0 ? c.st.missedDay : null;
  const rewards = c.rewards.map((r) => ({
    day: r.day, reward: pub(r),
    status: r.day <= c.lastDay ? 'CLAIMED' : (r.day === missed && r.day !== c.nextDay) ? 'MISSED' : (r.day === c.nextDay && c.lastDay < total ? (c.canClaim ? 'TODAY' : 'LOCKED') : 'LOCKED'),
    ...(r.day === c.nextDay && !c.canClaim && c.nextClaimAt ? { nextClaimAt: c.nextClaimAt } : {}),
  }));
  return {
    success: true, serverTime: new Date(c.now).toISOString(),
    streak: {
      currentStreak: c.lastDay, currentDay: c.nextDay, checkedIn: c.lastDay, totalRewards: total,
      status: c.st.status === 'RESET' && c.lastDay === 0 ? 'RESET' : 'ACTIVE', wasReset: c.st.status === 'RESET' && c.lastDay === 0,
      canClaim: c.canClaim, nextClaimAt: c.nextClaimAt, nextReward: pub(nextReward),
    },
    ultimateReward: { day: total, ...pub(c.rewards[total - 1]) },
    rewards, wallet: { VES: user?.wallet?.VES ?? 0 },
  };
}

async function getStatus(userId) {
  const c = await load(userId);
  return { success: true, serverTime: new Date(c.now).toISOString(), currentDay: c.nextDay, canClaim: c.canClaim, nextClaimAt: c.nextClaimAt };
}

async function claim(userId, body, ip) {
  await audit(userId, 'STREAK_CLAIM_REQUEST', { requestedDay: body.day }, ip);
  const c = await load(userId);
  const reject = async (event, err) => { await audit(userId, event, { code: err.code, requestedDay: body.day }, ip); throw err; };
  // Client "day"/"reward"/"streak"/"userId" are never trusted; "day" is only cross-checked.
  if (body.day !== undefined && Number(body.day) !== c.nextDay)
    await reject('INVALID_CLAIM', new AppError(400, 'INVALID_DAY', 'This reward is not available yet.'));
  if (!c.canClaim) {
    await reject('STREAK_CLAIM_REJECTED', new AppError(403, 'LOCKED', 'Your next reward is not available yet.', { nextClaimAt: c.nextClaimAt }));
  }
  const reward = c.rewards.find((r) => r.day === c.nextDay);
  if (!reward) await reject('INVALID_CLAIM', new AppError(400, 'NO_REWARD', 'No reward configured.'));
  const total = c.rewards.length, claimedAt = new Date(c.now), prev = c.st.toObject();

  // Atomic gate: only ONE concurrent request can move lastDay forward.
  const adv = await StreakState.findOneAndUpdate(
    { _id: c.st._id, cycleNo: prev.cycleNo, lastDay: prev.lastDay, lastClaimAt: prev.lastClaimAt },
    { $set: { missedDay: null, lastDay: c.nextDay, lastClaimAt: claimedAt, status: c.nextDay >= total ? 'COMPLETED' : 'ACTIVE' } }, { new: true });
  if (!adv) await reject('DUPLICATE_CLAIM', new AppError(409, 'ALREADY_CLAIMED', 'This reward has already been claimed.'));

  let credited = false, claimDoc;
  try {
    const referenceId = 'STREAK-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    claimDoc = await StreakClaim.create({ userId, cycleNo: prev.cycleNo, day: c.nextDay, rewardId: reward._id, referenceId, claimedAt });
    let before, after;
    if (reward.rewardType === 'VES') {
      const u = await User.findByIdAndUpdate(userId, { $inc: { 'wallet.VES': reward.amount } }, { new: true });
      credited = true; after = u.wallet.VES; before = after - reward.amount;
    } else { before = after = (await User.findById(userId)).wallet.VES; }
    const tx = await WalletTransaction.create({
      userId, rewardType: reward.rewardType, currency: reward.currency, amount: reward.amount, streakDay: c.nextDay,
      referenceId, balanceBefore: before, balanceAfter: after, status: reward.rewardType === 'VES' ? 'COMPLETED' : 'PENDING_FULFILLMENT' });
    await StreakClaim.updateOne({ _id: claimDoc._id }, { transactionId: tx._id });
    await audit(userId, 'STREAK_CLAIM_SUCCESS', { day: c.nextDay, referenceId }, ip);
    return { success: true, message: 'Reward claimed!', claimed: { day: c.nextDay, referenceId, ...pub(reward) } };
  } catch (e) { // manual rollback (standalone Mongo has no transactions)
    if (credited) await User.updateOne({ _id: userId }, { $inc: { 'wallet.VES': -reward.amount } });
    if (claimDoc) await StreakClaim.deleteOne({ _id: claimDoc._id });
    await StreakState.updateOne({ _id: c.st._id }, { $set: { lastDay: prev.lastDay, lastClaimAt: prev.lastClaimAt, status: prev.status } });
    throw e;
  }
}

const history = (userId) => StreakClaim.find({ userId }).sort({ claimedAt: -1 }).limit(50).lean()
  .then((items) => ({ success: true, items }));

module.exports = { AppError, getStreak, getStatus, claim, history };
