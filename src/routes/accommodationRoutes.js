const express = require('express');
const router = express.Router();
const AccommodationController = require('../controllers/AccommodationController');

// 특정 시군에 있는 숙박시설을 가져오는 엔드포인트, 숙박 유형 필터링 추가
router.get(
  '/accommodations/:region',
  AccommodationController.getAccommodations
);

module.exports = router;
//강릉의 모든 숙박: /api/accommodations/강릉시
//강릉의 모든 모텔 :/api/accommodations/강릉시?category=모텔
//강릉의 모든 펜션: /api/accommodations/강릉시?category=펜션
