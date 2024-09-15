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
); // OK맞춤형도 ok https://localhost/api/activities/search?keyword=&custom=true

// Route to get details and sentiment analysis of a specific vendor
router.get('/:id/details', authorize, VendorController.getVendorDetails); //OK다만 감정분석결과는 안 보임

// 사용자 맞춤형 추천 장소를 시군별로 집계하여 반환하는 엔드포인트
router.get(
  '/custom-vendors/:userId',
  VendorController.getCustomVendorsByRegion
); //ok

// Route to get 사용자  recent search history
router.get('/:userId/history', VendorController.getSearchHistory); //Ok

// 특정 카테고리와 시군에 해당하는 장소(업체) 리스트 반환
router.get(
  '/vendors/list/:userId',
  authorize,
  VendorController.getVendorsByCategoryAndRegion
); // 검토해보기

//숙박을 위해 새로 추가:vendorsdetails 업데이트
router.get('/vendors/:id', authorize, VendorController.getVendorDetails);
router.get(
  '/accommodation/:sigungu',
  authorize,
  VendorController.getAccommodationInfo
); //ok
router.get(
  '/accommodation/:sigungu/details',
  authorize,
  VendorController.getAccommodationDetails
); //ok

// 찜 기능 라우트
router.post('/wishlist', authorize, WishlistController.addToWishlist); // 찜 추가 OK
router.get('/wishlist', authorize, WishlistController.getWishlist); // 찜 목록 조회 ok
router.delete('/wishlist', authorize, WishlistController.removeFromWishlist); // 찜 제거 ok

module.exports = router;
