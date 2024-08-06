const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

// 새로운 사용자 생성
router.post('/users', userController.createUser);

// 사용자 ID로 사용자 조회
router.get('/users/:id', userController.getUserById);

// 사용자 ID로 사용자 업데이트
router.patch('/users/:id', userController.updateUser);

// 사용자 ID로 사용자 삭제
router.delete('/users/:id', userController.deleteUser);

// 사용자 프로필에 자격증 추가
router.post('/users/:id/certificates', userController.addCertificate);

// 사용자 프로필에서 자격증 삭제
router.delete(
  '/users/:id/certificates/:certificateId',
  userController.removeCertificate
);

// 사용자 밸런스 게임 결과를 기반으로 취향 설정
router.post('/users/preferences/game', userController.setPreferencesFromGame);

module.exports = router;
