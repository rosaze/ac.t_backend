const MentorService = require('../services/MentorService');

class MentorController {
  async createMentorPost(req, res) {
    try {
      const mentorPost = await MentorService.createMentorPost({
        ...req.body,
        mentor: req.user._id,
      });
      res.status(201).json(mentorPost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async joinMentorChatRoom(req, res) {
    try {
      const { mentorId, userId } = req.body;

      // 멘토 채팅방 참여
      const chatRoom = await MentorService.joinMentorChatRoom(mentorId, userId);
      res.status(200).json({ chatRoomId: chatRoom._id });
    } catch (err) {
      res.status(500).json({ message: err.message });
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
}

module.exports = new MentorController();
