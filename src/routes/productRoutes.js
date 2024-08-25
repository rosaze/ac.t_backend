//클라이언트가 상품 목록 조회하거나 상품 상세 정보 확인 가능한 라우트

const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const authorize = require('../middleware/authorize');

router.get('/products', authorize, ProductController.getProduct); // 상품 목록 조회
//router.get('/products/:id', authorize, ProductController.getProductById); // 상품 상세 조회

// 관리자용 추가 기능
router.post('/products', authorize, ProductController.createProduct); // 상품 생성
router.put('/products/:id', authorize, ProductController.updateProduct); // 상품 업데이트
router.delete('/products/:id', authorize, ProductController.deleteProduct); // 상품 삭제

module.exports = router;
