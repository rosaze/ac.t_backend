const express = require('express');
const activityMapController = require('../controllers/ActivityMapController');
const router = express.Router();
const authorize = require('../middleware/authorize');

// 인증된 사용자만 활동 기록 추가 가능
router.post('/', authorize, activityMapController.addActivityMap);

// 인증된 사용자만 자신의 활동 기록 조회 가능
router.get('/:userId', authorize, activityMapController.getActivityMaps);

module.exports = router;
