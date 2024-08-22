const express = require('express');
const RentalController = require('../controllers/RentalController');

const router = express.Router();

// 렌탈 장비 생성
router.post('/', RentalController.createRental);

// 렌탈 장비 목록 조회
router.get('/', RentalController.listRentals);

// 특정 렌탈 장비 조회
router.get('/:rentalId', RentalController.getRental);

// 렌탈 장비 수정
router.put('/:rentalId', RentalController.updateRental);

// 렌탈 장비 삭제
router.delete('/:rentalId', RentalController.deleteRental);

module.exports = router;
