const express = require('express');
const router = express.Router();
const MateController = require('../controllers/MateController');

router.post('/mates', MateController.createMatePost);
router.get('/mates', MateController.getMatePosts); // GET 요청에서 쿼리 파라미터를 통해 필터링 가능

//특정 기준으로 필터링하는 라우트 추가
router.get('/mates/filter/activity', MateController.filterMatePostsByActivity);
router.get('/mates/filter/location', MateController.filterMatePostsByLocation);
router.get(
  '/mates/filter/preferences',
  MateController.filterMatePostsByPreferences
);

router.get('/mates/:id', MateController.getMatePostById);
router.put('/mates/:id/join', MateController.joinMatePost);
router.put('/mates/:id/leave', MateController.leaveMatePost);
router.delete('/mates/:id', MateController.deleteMatePost);
router.post('/mates/:id/join-chat', MateController.joinMateChatRoom); // 참여하여 채팅방으로 이동

module.exports = router;
