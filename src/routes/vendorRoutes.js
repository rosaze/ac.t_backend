// 업체명 검색 및 추가 처리
const express = require('express');
const router = express.Router();
const VendorController = require('../controllers/VendorController');

router.get('/vendors/search', VendorController.searchVendors); // 업체명 검색
router.post('/vendors', VendorController.addVendor); // 업체명 추가

// 장소 검색 라우트
router.get('/activities/search', VendorController.searchActivities);

// 특정 장소의 상세 정보 및 감정 분석 결과 라우트
router.get('/activities/:id', VendorController.getVendorDetails);
module.exports = router;
