const express = require('express');
const router = express.Router();
const MypageController = require('../controllers/MypageController');
const BadgeService = require('../services/badgeService');
const authorize = require('../middleware/authorize');

const badgeService = new BadgeService();
const mypageController = new MypageController(badgeService);

// 개인 정보 관리
router.get('/mypage/info', authorize, (req, res) =>
  mypageController.getPersonalInfo(req, res)
);

// 전문 자격증 등록 및 관리
router.post('/mypage/certificates', authorize, (req, res) =>
  mypageController.manageCertificates(req, res)
);
router.delete('/mypage/certificates/:certificateId', authorize, (req, res) =>
  mypageController.manageCertificates(req, res)
);

// 사용자 배지 조회
router.get('/mypage/badges', authorize, (req, res) =>
  mypageController.getUserBadges(req, res)
);

// 활동 기록 조회 및 요약
router.get('/mypage/activitymap', authorize, (req, res) =>
  mypageController.getActivityMap(req, res)
);

// 사용자 선호도 업데이트
router.put('/mypage/preferences', authorize, (req, res) =>
  mypageController.updatePreferences(req, res)
);

// 사용자 선호도 기반 활동 추천
router.get('/mypage/recommend-activities', authorize, (req, res) =>
  mypageController.recommendActivities(req, res)
);

// 사용자 찜 목록 조회
router.get('/mypage/wishlist', authorize, (req, res) =>
  mypageController.getWishlist(req, res)
);

// 사용자 채팅방 목록 조회
router.get('/mypage/chatrooms', authorize, (req, res) =>
  mypageController.getChatRooms(req, res)
);

module.exports = router;
