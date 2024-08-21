const PaymentService = require('../services/PaymentService');

class PaymentController {
  // 결제 승인 처리
  async confirmPayment(req, res) {
    try {
      const { paymentKey, orderId, amount, productType, userId } = req.body;
      const paymentData = await PaymentService.confirmPayment(
        paymentKey,
        orderId,
        amount,
        productType,
        userId
      );
      res.status(200).json(paymentData);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error confirming payment', error: error.message });
    }
  }

  // paymentKey로 결제 정보 조회
  async getPaymentByKey(req, res) {
    try {
      const { paymentKey } = req.params;
      const paymentData = await PaymentService.getPaymentByKey(paymentKey);
      res.status(200).json(paymentData);
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'Error fetching payment by key',
          error: error.message,
        });
    }
  }

  // orderId로 결제 정보 조회
  async getPaymentByOrderId(req, res) {
    try {
      const { orderId } = req.params;
      const paymentData = await PaymentService.getPaymentByOrderId(orderId);
      res.status(200).json(paymentData);
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'Error fetching payment by order ID',
          error: error.message,
        });
    }
  }

  // 결제 취소 처리
  async cancelPayment(req, res) {
    try {
      const { paymentKey } = req.params;
      const { cancelReason } = req.body;
      const cancelData = await PaymentService.cancelPayment(
        paymentKey,
        cancelReason
      );
      res.status(200).json(cancelData);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error canceling payment', error: error.message });
    }
  }

  // 가상계좌 생성 처리
  async createVirtualAccount(req, res) {
    try {
      const { amount, orderId, orderName, userId, bank } = req.body;
      const virtualAccountData = await PaymentService.createVirtualAccount(
        amount,
        orderId,
        orderName,
        userId,
        bank
      );
      res.status(200).json(virtualAccountData);
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'Error creating virtual account',
          error: error.message,
        });
    }
  }

  // 현금영수증 발급 내역 조회 (추가 기능)
  async getCashReceipt(req, res) {
    try {
      const { paymentKey } = req.params;
      const paymentData = await PaymentService.getPaymentByKey(paymentKey);

      if (!paymentData.cashReceipt) {
        return res
          .status(404)
          .json({ message: 'Cash receipt not found for this payment.' });
      }

      res.status(200).json(paymentData.cashReceipt);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error fetching cash receipt', error: error.message });
    }
  }

  // 전체 현금영수증 발급 및 취소 이력 조회 (추가 기능)
  async getCashReceiptHistory(req, res) {
    try {
      const { paymentKey } = req.params;
      const paymentData = await PaymentService.getPaymentByKey(paymentKey);

      if (!paymentData.cashReceipts || paymentData.cashReceipts.length === 0) {
        return res
          .status(404)
          .json({ message: 'No cash receipt history found for this payment.' });
      }

      res.status(200).json(paymentData.cashReceipts);
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'Error fetching cash receipt history',
          error: error.message,
        });
    }
  }
}

module.exports = new PaymentController();
