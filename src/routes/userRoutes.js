const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const BadgeController = require('../controllers/BadgeController');

const MyPageController = require('../controllers/MypageController');
const authorize = require('../middleware/authorize');

//사용자 등록
router.post('/users', userController.createUser); //테스트 완료
//사용자 조회
router.get('/users/:id', authorize, userController.getUserById); //테스트 완료
//사용자 업데이트 (수정)
router.patch('/users/:id', authorize, userController.updateUser); //테스트 완료
//사용자 삭제
router.delete('/users/:id', authorize, userController.deleteUser); //테스트 완료

//자격증 등록
router.post(
  '/users/:id/certificates',
  authorize,
  userController.addCertificate
); //테스트 완료

//자격증 삭제
router.delete(
  '/users/:id/certificates/:certificateId',
  authorize,
  userController.removeCertificate
); //테스트 완료

// 배지 삭제 라우트 추가
router.delete('/users/:id/badge', authorize, BadgeController.removeBadge);

//사용자 프로필 정보 반환 (프로필 클릭 시 팝업창)
router.get('/profile/:id', authorize, userController.getUserProfile); //테스트 완료

module.exports = router;
