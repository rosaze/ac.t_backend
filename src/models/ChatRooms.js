const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  mateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mate' }, // Mate 글에 대한 채팅방 추적
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatRoom', ChatRoomSchema);
