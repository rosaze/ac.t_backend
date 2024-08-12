const express = require('express');
const router = express.Router();
const MateController = require('../controllers/MateController');

router.post('/mates', MateController.createMatePost);
router.get('/mates', MateController.getMatePosts); // GET 요청에서 쿼리 파라미터를 통해 필터링 가능
router.get('/mates/:id', MateController.getMatePostById);
router.put('/mates/:id/join', MateController.joinMatePost);
router.put('/mates/:id/leave', MateController.leaveMatePost);
router.delete('/mates/:id', MateController.deleteMatePost);
router.post('/mates/:id/join-chat', MateController.joinMateChatRoom); // 참여하여 채팅방으로 이동

module.exports = router;
