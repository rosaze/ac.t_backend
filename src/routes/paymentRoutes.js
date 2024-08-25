const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const authorize = require('../middleware/authorize');

router.post('/confirm', authorize, PaymentController.confirmPayment); // 결제 승인
router.get(
  '/paymentKey/:paymentKey',
  authorize,
  PaymentController.getPaymentByKey
); // paymentKey로 결제 조회
router.get(
  '/orderId/:orderId',
  authorize,
  PaymentController.getPaymentByOrderId
); // orderId로 결제 조회
router.post('/cancel/:paymentKey', authorize, PaymentController.cancelPayment); // 결제 취소
router.post(
  '/virtual-account',
  authorize,
  PaymentController.createVirtualAccount
); // 가상계좌 발급

module.exports = router;
