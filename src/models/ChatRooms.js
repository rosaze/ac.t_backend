const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//참여자와 메세지
const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatRoomSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;
