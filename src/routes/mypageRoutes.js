const express = require('express');
const router = express.Router();
const MypageController = require('../controllers/MypageController');
const ActivityMapController = require('../controllers/ActivityMapController');
const authorize = require('../middleware/authorize');

// 개인 정보 관리
router.get('/mypage/info', authorize, MypageController.getPersonalInfo); //테스트 완료

// 전문 자격증 등록 및 확인
router.post(
  '/mypage/certificates', //테스트 완료
  authorize,
  MypageController.manageCertificates
);
router.delete(
  '/mypage/certificates/:certificateId', //테스트 완료
  authorize,
  MypageController.manageCertificates
);

// 마이페이지 활동 기록 및 요약
router.get('/mypage/activitymap', authorize, MypageController.getActivityMap);
router.get(
  '/mypage/activity-summary',
  authorize,
  MypageController.getActivitySummary
);

// 액티비티 맵 관련 라우트 (활동기록 추가, 조회)
router.post(
  '/mypage/activitymap',
  authorize,
  ActivityMapController.addActivityMap
);
router.get(
  '/mypage/activitymap/:userId',
  authorize,
  ActivityMapController.getActivityMaps
);

// 안 가본 곳 추천
router.get(
  //테스트 완료
  '/mypage/recommendations',
  authorize,
  MypageController.recommendNewPlaces
);

// 사용자 배지 조회 및 지급 처리
router.get('/mypage/badges', authorize, MypageController.getUserBadges); //테스트 완료
router.post(
  '/mypage/badges/award', //테스트 완료, 없어도 될 듯
  authorize,
  MypageController.processBadgeAward
);

// 밸런스 게임 후 선호도 업데이트
router.post(
  // 테스트 완료
  '/mypage/balance-game/update-preferences',
  authorize,
  MypageController.updatePreferenceAfterBalanceGame
);

// 활동 기록 분석 결과에 따른 취향 추천
router.get(
  '/mypage/preference-recommendation',
  authorize,
  MypageController.getPreferenceRecommendation
); //테스트 완료, 좀 더 활동 데이터 넣어서 테스트 다시 해봐야할 듯

module.exports = router;
