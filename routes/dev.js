const r = require('express').Router();
const auth = require('../middleware/auth');
const StreakState = require('../models/StreakState');
r.use(auth);
// Move last claim back N hours (simulates time passing for the logged-in user)
r.post('/shift', async (q, s) => {
  const st = await StreakState.findOne({ userId: q.userId });
  if (st?.lastClaimAt) { st.lastClaimAt = new Date(+st.lastClaimAt - (Number(q.body.hours) || 0) * 36e5); await st.save(); }
  s.json({ success: true, lastClaimAt: st?.lastClaimAt || null });
});
r.post('/reset', async (q, s) => { await StreakState.deleteOne({ userId: q.userId }); s.json({ success: true }); });
module.exports = r;
