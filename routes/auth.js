const r = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const wrap = (fn) => (q, s, n) => fn(q, s, n).catch(n);
const limiter = rateLimit({ windowMs: 15 * 60000, max: 30, message: { success: false, message: 'Too many attempts. Try again later.' } });
const bad = (s, m, c = 400) => s.status(c).json({ success: false, message: m });

r.post('/register', limiter, wrap(async (q, s) => {
  const name = String(q.body.name || '').trim(), email = String(q.body.email || '').trim().toLowerCase(), password = String(q.body.password || '');
  if (name.length < 2) return bad(s, 'Please enter your name.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return bad(s, 'Please enter a valid email.');
  if (password.length < 6) return bad(s, 'Password must be at least 6 characters.');
  if (await User.findOne({ email })) return bad(s, 'This email is already registered. Please log in.', 409);
  const u = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10) });
  s.status(201).json({ success: true, token: sign(u), user: { name: u.name, email: u.email } });
}));
r.post('/login', limiter, wrap(async (q, s) => {
  const u = await User.findOne({ email: String(q.body.email || '').trim().toLowerCase() });
  if (!u || !(await bcrypt.compare(String(q.body.password || ''), u.passwordHash))) return bad(s, 'Invalid email or password.', 401);
  s.json({ success: true, token: sign(u), user: { name: u.name, email: u.email } });
}));
r.get('/me', auth, wrap(async (q, s) => { const u = await User.findById(q.userId).lean(); s.json({ success: true, user: { name: u.name, email: u.email, wallet: u.wallet } }); }));
module.exports = r;
