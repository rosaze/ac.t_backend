const ChatRoom = require('../models/ChatRooms');
const Message = require('../models/Messages');
const BadgeService = require('./badgeService'); // 배지 서비스를 가져옵니다.

class ChatService {
  // 채팅방 생성
  async createChatRoom(
    name,
    participants,
    creatorId,
    mateId = null,
    mentorId = null
  ) {
    const chatRoom = new ChatRoom({
      name,
      participants,
      mateId,
      mentorId,
      creator: creatorId,
    });
    const saveChatRoom = await chatRoom.save();

    // 메이트 채팅방이 새로 생성된 경우 배지 지급
    if (mateId) {
      const badgeName = `${name} 리더`; // 채팅방 제목 + 리더로 배지 이름
      await BadgeService.awardBadge(creatorId, badgeName);
    }

    return saveChatRoom;
  }

  // 특정 Mate 게시글 ID로 채팅방 찾기
  async findChatRoomByMateId(mateId) {
    return await ChatRoom.findOne({ mateId }).exec();
  }

  // 특정 Mentor 게시글 ID로 채팅방 찾기
  async findChatRoomByMentorId(mentorId) {
    return await ChatRoom.findOne({ mentorId }).exec();
  }

  // 사용자 채팅방에 추가
  async addUserToChatRoom(chatRoomId, userId) {
    return await ChatRoom.findByIdAndUpdate(
      chatRoomId,
      { $addToSet: { participants: userId } },
      { new: true }
    ).exec();
  }

  // 메시지 보내기
  async sendMessage(chatRoomId, senderId, messageText) {
    const message = new Message({
      chatRoom: chatRoomId,
      sender: senderId,
      message: messageText,
    });
    return await message.save();
  }

  // 채팅방의 모든 메시지 가져오기
  async getMessages(chatRoomId) {
    return await Message.find({ chatRoom: chatRoomId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 }) // 메시지 생성 순서대로 정렬
      .exec();
  }

  // 사용자가 속한 모든 채팅방 가져오기
  async getChatRoomsByUser(userId) {
    return await ChatRoom.find({ participants: userId })
      .populate('creator', 'name')
      .sort({ createdAt: -1 }) // 최신 채팅방부터 정렬
      .exec();
  }

  async deleteChatRoomByMentorId(mentorId, session) {
    const result = await ChatRoom.deleteOne({ mentorId: mentorId }).session(
      session
    );
    if (result.deletedCount === 0) {
      console.log(`No chat room found for mentor post: ${mentorId}`);
    } else {
      console.log(`Deleted chat room for mentor post: ${mentorId}`);
    }
    return result;
  }
}

module.exports = new ChatService();
