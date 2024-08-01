const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

// 사용자와 관련된 기본 CRUD 작업 처리
router.post('/users', userController.createUser);
router.get('/users/:id', userController.getUserById);
router.patch('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
