const m = require('mongoose');
module.exports = m.model('AuditLog', new m.Schema({
  userId: m.Types.ObjectId, event: String, meta: Object, ip: String,
}, { timestamps: true }));
