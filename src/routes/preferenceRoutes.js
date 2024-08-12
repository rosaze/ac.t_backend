const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

// 밸런스 게임 결과 저장 및 선호도 설정
router.post(
  '/users/:id/balance-game-result',
  userController.saveBalanceGameResult
);
// 사용자에게 활동 추천 제공
router.get(
  '/users/:id/recommendations',
  userController.getRecommendedActivities
);
// 사용자 활동 요약, 선호도 변경 추천, 선호도 업데이트 제공
router.post(
  '/users/:id/activity-summary-and-preference-recommendation',
  userController.getActivitySummaryAndPreferenceRecommendation
);

module.exports = router;
