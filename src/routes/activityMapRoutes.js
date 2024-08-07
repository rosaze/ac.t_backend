const express = require('express');
const activityMapController = require('../controllers/ActivityMapController');
const router = express.Router();

router.post('/', activityMapController.addActivityMap); // 활동 기록 추가
router.get('/:userId', activityMapController.getActivityMaps); // 사용자 활동 기록 조회

module.exports = router;
