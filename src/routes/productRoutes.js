const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const authorize = require('../middleware/authorize');

// 일반 사용자용 라우트
router.get('/products', ProductController.listProducts); // 상품 목록 조회
router.get('/products/:productId', ProductController.getProduct); // 상품 상세 조회

// 관리자용 라우트
router.post('/admin/products', authorize, ProductController.createProduct); // 상품 생성
router.put(
  '/admin/products/:productId',
  authorize,
  ProductController.updateProduct
); // 상품 업데이트
router.delete(
  '/admin/products/:productId',
  authorize,
  ProductController.deleteProduct
); // 상품 삭제

module.exports = router;
