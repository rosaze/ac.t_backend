const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

const MyPageController = require('../controllers/MypageController');
const authorize = require('../middleware/authorize');

//사용자 등록
router.post('/users', userController.createUser); //테스트 완료
//사용자 조회
router.get('/users/:id', userController.getUserById); //테스트 완료
//사용자 업데이트
router.patch('/users/:id', userController.updateUser); //테스트 완료
//사용자 삭제
router.delete('/users/:id', userController.deleteUser); //테스트 완료

//자격증 등록
router.post('/users/:id/certificates', userController.addCertificate); //테스트 완료
//자격증 삭제
router.delete(
  '/users/:id/certificates/:certificateId',
  userController.removeCertificate
); //테스트 완료

//사용자 프로필 정보 반환 (프로필 클릭 시 팝업창)
router.get('/profile/:id', userController.getUserProfile); //테스트 완료

module.exports = router;
