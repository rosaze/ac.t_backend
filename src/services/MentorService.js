const Mentor = require('../models/Mentor');
const User = require('../models/User');
const ChatService = require('./ChatService');

class MentorService {
  async createMentorPost(userId, mentorData) {
    try {
      if (!userId) {
        console.error('userId is not defined');
        throw new Error('userId is not defined');
      }

      const user = await User.findById(userId);
      if (!user) {
        console.error(`User not found: ${userId}`);
        throw new Error('User not found');
      }

      console.log(`User isMentor status: ${user.isMentor}`);
      if (!user.isMentor) {
        console.error(`User is not eligible to be a mentor: ${userId}`);
        throw new Error('User is not eligible to be a mentor');
      }

      const newMentorPost = new Mentor({
        mentor: userId,
        title: mentorData.title,
        description: mentorData.description,
        locationTag: mentorData.locationTag,
        activityTag: mentorData.activityTag,
        date: mentorData.date,
        price: mentorData.price,
        maxMentees: mentorData.maxMentees,
        currentMentees: 0,
      });

      await newMentorPost.save();
      console.log(`Mentor post created successfully for user: ${userId}`);
      return newMentorPost;
    } catch (error) {
      console.error(`Error in createMentorPost: ${error.message}`, error);
      throw new Error(`Failed to create mentor post: ${error.message}`);
    }
  }

  async joinMentorChatRoom(mentorPostId, userId) {
    const mentorPost = await this.getMentorPostById(mentorPostId);
    const creatorId = mentorPost.mentor;

    let chatRoom = await ChatService.findChatRoomByMentorId(mentorPostId);
    if (!chatRoom) {
      chatRoom = await ChatService.createChatRoom(
        `Mentor 채팅방`,
        [userId],
        creatorId,
        null,
        mentorPostId
      );
    } else {
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
      .populate({
        path: 'mentor',
        select: 'email name certifications age gender preference -_id',
      })
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 멘토 포스트 삭제
      const deletedMentorPost = await Mentor.findByIdAndDelete(id).session(
        session
      );

      if (!deletedMentorPost) {
        throw new Error('Mentor post not found');
      }

      // 관련 채팅방 삭제
      await ChatService.deleteChatRoomByMentorId(id, session);

      await session.commitTransaction();
      session.endSession();

      return deletedMentorPost;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error in deleteMentorPost:', error);
      throw error;
    }
  }

  async addMenteeToProgram(mentorPostId, menteeId) {
    try {
      const mentorPost = await Mentor.findById(mentorPostId);
      if (!mentorPost) {
        throw new Error('Mentor post not found');
      }

      // Check if mentee is already registered
      const alreadyRegistered = mentorPost.mentees.some(
        (mentee) => mentee.id.toString() === menteeId.toString()
      );
      if (alreadyRegistered) {
        throw new Error('Mentee has already joined this mentor program');
      }

      // Check if the mentor program is full
      if (mentorPost.currentMentees >= mentorPost.maxMentees) {
        throw new Error('This mentor program is already full');
      }

      // Get mentee details
      const mentee = await User.findById(menteeId);
      if (!mentee) {
        throw new Error('Mentee not found');
      }

      // Add mentee details
      mentorPost.mentees.push({
        id: menteeId,
        gender: mentee.gender,
        age: mentee.age,
        preferences: mentee.preferences,
      });
      mentorPost.currentMentees += 1;
      await mentorPost.save();

      return mentorPost;
    } catch (error) {
      console.error(`Error in addMenteeToProgram: ${error.message}`, error);
      throw error;
    }
  }
}

module.exports = new MentorService();
