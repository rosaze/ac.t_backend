const express = require('express');
const router = express.Router();
const MentorController = require('../controllers/MentorController');

router.post('/mentors', MentorController.createMentorPost);
router.get('/mentors', MentorController.getMentorPosts);
router.get('/mentors/:id', MentorController.getMentorPostById);
router.post('/mentors/:id/join-chat', MentorController.joinMentorChatRoom); // 참여 버튼을 통한 채팅방 참여
router.delete('/mentors/:id', MentorController.deleteMentorPost);

module.exports = router;
