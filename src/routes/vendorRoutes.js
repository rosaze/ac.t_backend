// 업체명 검색 및 추가 처리
const express = require('express');
const router = express.Router();
const VendorController = require('../controllers/VendorController');
const WishlistController = require('../controllers/WishlistController'); // 찜 라우터 추가
const authorize = require('../middleware/authorize');

router.get('/vendors/search', authorize, VendorController.searchVendors); // 업체명 검색
router.post('/vendors', authorize, VendorController.addVendor); // 업체명 추가

// 장소 검색 라우트
router.get('/activities/search', authorize, VendorController.searchActivities);

// 특정 장소의 상세 정보 및 감정 분석 결과 라우트
router.get('/activities/:id', authorize, VendorController.getVendorDetails);
module.exports = router;
// 검색 화면 로드 시 사용자 추천 장소와 최근 검색 기록 제공
router.get(
  '/initial-search-data',
  authorize,
  VendorController.getInitialSearchData
);
module.exports = router;

// 찜 기능 라우트
router.post('/wishlist', authorize, VendorController.addToWishlist); // 찜 추가
router.get('/wishlist', authorize, VendorController.getWishlist); // 찜 목록 조회
router.delete('/wishlist', authorize, VendorController.removeFromWishlist); // 찜 제거
