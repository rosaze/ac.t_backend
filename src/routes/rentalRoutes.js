const express = require('express');
const RentalController = require('../controllers/RentalController.js');
const authorize = require('../middleware/authorize');

const router = express.Router();

// 렌탈 장비 생성
router.post('/', authorize, RentalController.createRental);

// 렌탈 장비 목록 조회
router.get('/', authorize, RentalController.listRentals);

// 특정 렌탈 장비 조회
router.get('/:rentalId', authorize, RentalController.getRental);

// 렌탈 장비 수정
router.put('/:rentalId', authorize, RentalController.updateRental);

// 렌탈 장비 삭제
router.delete('/:rentalId', authorize, RentalController.deleteRental);

module.exports = router;
