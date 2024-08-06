const express = require('express');
const profileController = require('../controllers/ProfileController');
const router = express.Router();

router.get('/:userId', profileController.getProfile); //사용자 프로필 조회
router.put('/:userId', profileController.updateProfile); // 사용자 프로필 수정

module.exports = router;
