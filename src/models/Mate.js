const mongoose = require('mongoose');
//메이트 모집 게시글 저장
const MateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  activity: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  maxParticipants: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Mate', MateSchema);
