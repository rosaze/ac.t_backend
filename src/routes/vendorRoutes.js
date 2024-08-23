// 업체명 검색 및 추가 처리
const express = require('express');
const router = express.Router();
const VendorController = require('../controllers/VendorController');
const WishlistController = require('../controllers/WishlistController'); // 찜 라우터 추가

router.get('/vendors/search', VendorController.searchVendors); // 업체명 검색
router.post('/vendors', VendorController.addVendor); // 업체명 추가

// 장소 검색 라우트
router.get('/activities/search', VendorController.searchActivities);

// 특정 장소의 상세 정보 및 감정 분석 결과 라우트
router.get('/activities/:id', VendorController.getVendorDetails);
module.exports = router;
// 검색 화면 로드 시 사용자 추천 장소와 최근 검색 기록 제공
router.get('/initial-search-data', VendorController.getInitialSearchData);
module.exports = router;

// 찜 기능 라우트
router.post('/wishlist', VendorController.addToWishlist); // 찜 추가
router.get('/wishlist', VendorController.getWishlist); // 찜 목록 조회
router.delete('/wishlist', VendorController.removeFromWishlist); // 찜 제거
