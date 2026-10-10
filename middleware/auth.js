const jwt = require('jsonwebtoken');
// Identity comes ONLY from the JWT. Any userId in body/query is ignored.
module.exports = (req, res, next) => {
  try {
    const t = (req.headers.authorization || '').replace('Bearer ', '');
    req.userId = jwt.verify(t, process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ success: false, code: 'UNAUTHENTICATED', message: 'Please log in to continue.' });
  }
};
