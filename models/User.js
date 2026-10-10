const m = require('mongoose');
module.exports = m.model('User', new m.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, required: true },
  passwordHash: { type: String, required: true },
  wallet: { VES: { type: Number, default: 0 } }, // wallet lives on the user, mutated only via $inc
}, { timestamps: true }));
