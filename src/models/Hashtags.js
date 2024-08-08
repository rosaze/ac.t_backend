const mongoose = require('mongoose');

const HashtagSchema = new mongoose.Schema({
  tag: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});

module.exports = mongoose.model('Hashtag', HashtagSchema);

// 사실 아예 hashtags.js 없애도 노상관 (단순 문자열이니까)
