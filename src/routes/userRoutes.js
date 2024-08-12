const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
//사용자 등록
router.post('/users', userController.createUser);
//사용자 조회
router.get('/users/:id', userController.getUserById);
//사용자 업데이트
router.patch('/users/:id', userController.updateUser);
//사용자 삭제
router.delete('/users/:id', userController.deleteUser);

//자격증 등록
router.post('/users/:id/certificates', userController.addCertificate);
//자격증 삭제
router.delete(
  '/users/:id/certificates/:certificateId',
  userController.removeCertificate
);

module.exports = router;
