const express = require('express');
const router = express.Router();
const MentorController = require('../controllers/MentorController');
const authorize = require('../middleware/authorize');

router.post('/mentors', authorize, MentorController.createMentorPost);
router.get('/mentors', authorize, MentorController.getMentorPosts);
router.get('/mentors/:id', authorize, MentorController.getMentorPostById);
router.post(
  '/mentors/:id/join-chat',
  authorize,
  MentorController.joinMentorChatRoom
); // 참여 버튼을 통한 채팅방 참여
router.delete('/mentors/:id', authorize, MentorController.deleteMentorPost);

module.exports = router;
