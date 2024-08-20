const ChatRoom = require('../models/ChatRooms');
const Message = require('../models/Messages');
const BadgeService = require('./badgeService');
// 참여버튼 누르면 이미 존재하거나 새 채팅방에 초대
class ChatService {
  async createChatRoom(name, participants, creatorId, mateId = null) {
    const chatRoom = new ChatRoom({
      name,
      participants,
      mateId,
      creator: creatorId,
    });
    const saveChatRoom = await chatRoom.save();

    //메이트 채팅방이 새로 생성된 경우 배지 지급
    if (mateId) {
      const badgeName = `${name} 리더`; // 채팅방 제목 + 리더로 배지 이름
      await BadgeService.awardBadge(creatorId, badgeName);
    }
    return saveChatRoom;
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
