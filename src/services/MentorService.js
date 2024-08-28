const Mentor = require('../models/Mentor');
const User = require('../models/User');
const ChatService = require('./ChatService');

class MentorService {
  async createMentorPost(data) {
    const user = await User.findById(data.mentor).exec();

    if (!user || !user.isMentor) {
      throw new Error('User is not eligible to be a mentor');
    }

    const mentorPost = new Mentor(data);
    return await mentorPost.save();
  }

  async joinMentorChatRoom(mentorId, userId) {
    // 멘토 게시글 가져오기
    const mentorPost = await this.getMentorPostById(mentorId);
    const creatorId = mentorPost.mentor; // 멘토 게시글 작성자를 채팅방 생성자로 지정

    // 채팅방이 이미 있는지 확인
    let chatRoom = await ChatService.findChatRoomByMentorId(mentorId);
    if (!chatRoom) {
      // 채팅방이 없으면 새로 생성
      chatRoom = await ChatService.createChatRoom(
        `Mentor 채팅방`,
        [userId],
        creatorId,
        null,
        mentorId
      );
    } else {
      // 이미 존재하는 채팅방에 유저 추가
      await ChatService.addUserToChatRoom(chatRoom._id, userId);
    }

    return chatRoom;
  }

  async getMentorPosts(filters) {
    const query = {};

    if (filters.activityTag) {
      query.activityTag = filters.activityTag;
    }
    if (filters.locationTag) {
      query.locationTag = filters.locationTag;
    }
    if (filters.date) {
      query.date = { $gte: new Date(filters.date) };
    }

    const sortCriteria =
      filters.sortBy === 'date' ? { date: 1 } : { createdAt: -1 };

    return await Mentor.find(query)
      .sort(sortCriteria)
      .populate('mentor')
      .exec();
  }

  async getMentorPostById(id) {
    const mentorPost = await Mentor.findById(id);
    if (!mentorPost) {
      throw new Error('Mentor post not found');
    }
    return mentorPost;
  }

  async deleteMentorPost(id) {
    return await Mentor.findByIdAndDelete(id).exec();
  }
}

module.exports = new MentorService();
