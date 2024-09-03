const express = require('express');
const router = express.Router();
const MypageController = require('../controllers/MypageController');
const authorize = require('../middleware/authorize');

// 개인 정보 관리
router.get('/mypage/info', authorize, MypageController.getPersonalInfo); //테스트 완료

// 전문 자격증 등록 및 확인
router.post(
  '/mypage/certificates',
  authorize,
  MypageController.manageCertificates
); // 테스트 완료
router.delete(
  '/mypage/certificates/:certificateId',
  authorize,
  MypageController.manageCertificates
); //테스트 완료

// 마이페이지 활동 기록
router.get('/mypage/activitymap', authorize, MypageController.getActivityMap);

// 안 가본 곳 추천
router.get(
  '/mypage/activity-map/recommendations',
  authorize,
  MypageController.recommendNewPlaces
);

// 사용자 배지 조회
router.get('/mypage/badges', authorize, MypageController.getUserBadges); //테스트 완료

// 배지 지급 처리
router.post('/mypage/badges/award', MypageController.processBadgeAward);

// 활동 기록 요약
router.get('/mypage/activity-summary', MypageController.getActivitySummary);

// 활동 기록 분석 결과에 따른 취향 변경 추천
router.get(
  '/mypage/preference-recommendation',
  MypageController.getPreferenceRecommendation
);

module.exports = router;
