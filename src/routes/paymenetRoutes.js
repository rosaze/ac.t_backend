const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');

router.post('/confirm', PaymentController.confirmPayment); // 결제 승인
router.get('/paymentKey/:paymentKey', PaymentController.getPaymentByKey); // paymentKey로 결제 조회
router.get('/orderId/:orderId', PaymentController.getPaymentByOrderId); // orderId로 결제 조회
router.post('/cancel/:paymentKey', PaymentController.cancelPayment); // 결제 취소
router.post('/virtual-account', PaymentController.createVirtualAccount); // 가상계좌 발급

module.exports = router;
