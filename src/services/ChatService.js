const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
// 참여버튼 누르면 이미 존재하거나 새 채팅방에 초대
class ChatService {
  async createChatRoom(name, participants) {
    const chatRoom = new ChatRoom({ name, participants });
    return await chatRoom.save();
  }

  async findChatRoomByMateId(mateId) {
    return await ChatRoom.findOne({ mateId }).exec();
  }

  async addUserToChatRoom(chatRoomId, userId) {
    return await ChatRoom.findByIdAndUpdate(
      chatRoomId,
      { $addToSet: { participants: userId } },
      { new: true }
    ).exec();
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

  async getChatRooms(userId) {
    return await ChatRoom.find({ participants: userId })
      .populate('participants')
      .exec();
  }
}

module.exports = new ChatService();
