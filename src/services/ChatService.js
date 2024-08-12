const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
//메세지 보내기, 채팅방 CRUD
class ChatService {
  async createChatRoom(name, participants) {
    const chatRoom = new ChatRoom({ name, participants });
    return await chatRoom.save();
  }

  async getChatRooms(userId) {
    return await ChatRoom.find({ participants: userId })
      .populate('participants')
      .exec();
  }

  async sendMessage(chatRoomId, senderId, messageContent) {
    const message = new Message({
      chatRoom: chatRoomId,
      sender: senderId,
      message: messageContent,
    });
    return await message.save();
  }

  async getMessages(chatRoomId) {
    return await Message.find({ chatRoom: chatRoomId })
      .populate('sender')
      .exec();
  }
}

module.exports = new ChatService();
