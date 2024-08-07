const mongoose = require('mongoose');

const userBadgeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  awarded_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserBadge', userBadgeSchema);
