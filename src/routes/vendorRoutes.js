// 업체명 검색 및 추가 처리
const express = require('express');
const router = express.Router();
const VendorController = require('../controllers/VendorController');

router.get('/vendors/search', VendorController.searchVendors); // 업체명 검색
router.post('/vendors', VendorController.addVendor); // 업체명 추가

module.exports = router;
