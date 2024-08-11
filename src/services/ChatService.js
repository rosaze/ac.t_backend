const ChatRoom = require('../models/ChatRooms');
// 채팅방 생성, 메세지 전송
exports.createChatRoom = async (participants) => {
  const chatRoom = new ChatRoom({ participants });
  await chatRoom.save();
  return chatRoom;
};

exports.getMessages = async (roomId) => {
  const chatRoom = await ChatRoom.findById(roomId).populate('messages.sender');
  return chatRoom.messages;
};

exports.sendMessage = async (roomId, sender, content) => {
  const chatRoom = await ChatRoom.findById(roomId);
  const message = { sender, content };
  chatRoom.messages.push(message);
  await chatRoom.save();
  return message;
};
