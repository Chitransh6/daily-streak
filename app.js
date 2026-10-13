require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const app = express();

app.set('trust proxy', 1);

const allowed = (process.env.CLIENT_URL || '').split(',').map((x) => x.trim()).filter(Boolean);
app.use(cors({ origin: (o, cb) => cb(null, !o || allowed.includes(o) || (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(o))) }));
app.use(express.json({ limit: '10kb' }));
app.use('/images', express.static('public/images'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/daily-streak', require('./routes/streak'));
if (process.env.NODE_ENV !== 'production') app.use('/api/dev', require('./routes/dev')); // test helpers only

// Never leak MongoServerError / CastError etc. to the client
app.use((err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ success: false, code: err.code, message: err.message, ...err.extra });
  console.error(err);
  res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Unable to process your reward. Please try again.' });
});

connectDB().then(() => app.listen(process.env.PORT || 5000, () => console.log('API on :' + (process.env.PORT || 5000))))
  .catch((e) => { console.error('DB connection failed:', e.message); process.exit(1); });
