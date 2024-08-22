//장바구니 관련 라우트
const express = require('express');
const CartController = require('../controllers/CartController');

const router = express.Router();

// 장바구니 조회
router.get('/', CartController.getCart);

// 장바구니에 상품 추가
router.post('/add', CartController.addItemToCart);

// 장바구니 아이템 수정 (수량이나 렌탈 기간 등)
router.put('/update', CartController.updateCartItem);

// 장바구니 아이템 삭제
router.delete('/remove/:productId', CartController.removeItemFromCart);

module.exports = router;
