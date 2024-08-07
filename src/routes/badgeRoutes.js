const express = require('express');
const badgeController = require('../controllers/BadgeController');
const router = express.Router();

router.post('/award', badgeController.awardBadge); // 배지 수여
router.get('/:userId', badgeController.getUserBadges); // 사용자 배지 조회

module.exports = router;
