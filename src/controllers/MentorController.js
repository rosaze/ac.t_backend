const MentorService = require('../services/MentorService');

class MentorController {
  async createMentorPost(req, res) {
    try {
      const userId = req.user._id || req.user.id;
      console.log(`Creating mentor post for user: ${userId}`);

      const newMentorPost = await MentorService.createMentorPost(
        userId,
        req.body
      );
      res.status(201).json(newMentorPost);
    } catch (error) {
      console.error(
        `Error in MentorController.createMentorPost: ${error.message}`,
        error
      );
      res.status(500).json({
        message: 'Failed to create mentor post',
        error: error.message,
      });
    }
  }

  async getMentorPosts(req, res) {
    try {
      const filters = {
        activityTag: req.query.activityTag,
        locationTag: req.query.locationTag,
        date: req.query.date,
        sortBy: req.query.sortBy,
      };
      const mentorPosts = await MentorService.getMentorPosts(filters);
      res.status(200).json(mentorPosts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getMentorPostById(req, res) {
    try {
      const mentorPost = await MentorService.getMentorPostById(req.params.id);
      res.status(200).json(mentorPost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async deleteMentorPost(req, res) {
    try {
      await MentorService.deleteMentorPost(req.params.id);
      res.status(200).json({ message: 'Mentor post deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async joinMentorProgram(req, res) {
    try {
      const { mentorPostId } = req.params;
      const menteeId = req.user._id;

      // 멘토 프로그램에 멘티 추가
      const updatedMentorPost = await MentorService.addMenteeToProgram(
        mentorPostId,
        menteeId
      );

      // 채팅방에 멘티 추가
      const chatRoom = await MentorService.joinMentorChatRoom(
        mentorPostId,
        menteeId
      );

      res.status(200).json({
        mentorPost: updatedMentorPost,
        chatRoomId: chatRoom._id,
      });
    } catch (error) {
      console.error(`Error in joinMentorProgram: ${error.message}`, error);
      res.status(500).json({
        message: 'Failed to join mentor program and chat room',
        error: error.message,
      });
    }
  }
}

module.exports = new MentorController();
