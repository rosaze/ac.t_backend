const express = require('express');
const router = express.Router();
const MypageController = require('../controllers/MypageController');
const ActivityMapController = require('../controllers/ActivityMapController');
const authorize = require('../middleware/authorize');

// 개인 정보 관리
router.get('/mypage/info', authorize, MypageController.getPersonalInfo);

// 전문 자격증 등록 및 확인
router.post(
  '/mypage/certificates',
  authorize,
  MypageController.manageCertificates
);
router.delete(
  '/mypage/certificates/:certificateId',
  authorize,
  MypageController.manageCertificates
);

// 마이페이지 활동 기록 및 요약
router.get('/mypage/activitymap', authorize, MypageController.getActivityMap); //ok
router.get(
  '/mypage/activity-summary',
  authorize,
  MypageController.getActivitySummary
); //ok

// 액티비티 맵 관련 라우트 (활동기록 추가, 조회)
router.post(
  '/mypage/activitymap',
  authorize,
  ActivityMapController.addActivityMap
); //Ok addactivitymap 메소드 참고
router.get(
  '/mypage/activitymap/:userId',
  authorize,
  ActivityMapController.getActivityMaps
); //OK

// 안 가본 곳 추천
router.get(
  '/mypage/recommendations',
  authorize,
  MypageController.recommendNewPlaces
);

// 사용자 배지 조회 및 지급 처리
router.get('/mypage/badges', authorize, MypageController.getUserBadges);
router.post(
  '/mypage/badges/award',
  authorize,
  MypageController.processBadgeAward
);

// 활동 기록 분석 결과에 따른 취향 추천
router.get(
  '/mypage/preference-recommendation',
  authorize,
  MypageController.getPreferenceRecommendation
);

module.exports = router;
