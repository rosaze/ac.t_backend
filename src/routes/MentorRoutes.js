const express = require('express');
const router = express.Router();
const MentorController = require('../controllers/MentorController');
const authorize = require('../middleware/authorize');

router.post('/mentors', authorize, MentorController.createMentorPost); //멘토 게시글 등록
router.get('/mentors', authorize, MentorController.getMentorPosts); //멘토 게시글 해시태그를 통해 가져오기
router.get('/mentors/:id', authorize, MentorController.getMentorPostById);
router.delete('/mentors/:id', authorize, MentorController.deleteMentorPost);
router.post(
  '/mentors/:mentorPostId/join',
  authorize,
  MentorController.joinMentorProgram
); //중복 인원 처리 - 한번만 참가 가능하도록 수정, chatroom db에서 멘티 아이디 나오도록
module.exports = router;
