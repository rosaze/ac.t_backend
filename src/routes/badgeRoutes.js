const express = require('express');
const badgeController = require('../controllers/BadgeController');
const router = express.Router();
const authorize = require('../middleware/authorize');

// 배지 수여 - 인증된 사용자만 가능
router.post('/award', authorize, badgeController.awardBadge);

// 사용자 배지 조회 - 인증된 사용자만 가능
router.get('/:userId', authorize, badgeController.getUserBadges);

module.exports = router;
