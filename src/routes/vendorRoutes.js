// 업체명 검색 및 추가 처리
const express = require('express');
const VendorController = require('../controllers/VendorController.js');
const WishlistController = require('../controllers/WishlistController'); // 찜 라우터 추가
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post('/add', authorize, VendorController.addVendor); // 업체명 추가

// 장소  키워드 검색 라우트
router.get(
  '/activities/search',
  authorize,
  VendorController.searchActivitiesByKeyword
);

// Route to get details and sentiment analysis of a specific vendor
router.get('/:id/details', authorize, VendorController.getVendorDetails);

// (초기 사용자 위한 ) Route to get initial search data (recommendations + recent searches)
router.get('/initial-data', VendorController.getInitialSearchData);

// 사용자 맞춤형 추천 장소를 시군별로 집계하여 반환하는 엔드포인트
router.get(
  '/custom-vendors/:userId',
  VendorController.getCustomVendorsByRegion
);
// Route to get 사용자  recent search history
router.get('/:userId/history', VendorController.getSearchHistory);

// 특정 카테고리와 시군에 해당하는 장소(업체) 리스트 반환
router.get(
  '/vendors/list',
  authorize,
  VendorController.getVendorsByCategoryAndRegion
);

// 찜 기능 라우트

router.post('/wishlist', authorize, WishlistController.addToWishlist); // 찜 추가 OK
router.get('/wishlist', authorize, WishlistController.getWishlist); // 찜 목록 조회
router.delete('/wishlist', authorize, WishlistController.removeFromWishlist); // 찜 제거

module.exports = router;
