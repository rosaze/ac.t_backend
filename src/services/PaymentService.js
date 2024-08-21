const fetch = require('node-fetch');
const Payment = require('../models/Payment');

class PaymentService {
  constructor() {
    this.baseUrl = 'https://api.tosspayments.com/v1';
    this.authorization =
      'Basic dGVzdF9za19Qb3h5MVhRTDhSYVpPalpuTzFaTnI3bk81V21sOg=='; // 인증 정보
  }

  async confirmPayment(paymentKey, orderId, amount, productType, userId) {
    const url = `${this.baseUrl}/payments/confirm`;
    const options = {
      method: 'POST',
      headers: {
        Authorization: this.authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      // 결제 승인 시 결제 정보 데이터베이스에 저장
      const payment = new Payment({
        paymentKey: data.paymentKey,
        orderId: data.orderId,
        amount: data.totalAmount,
        currency: data.currency,
        status: data.status,
        method: data.method,
        transactionId: data.transactionId,
        lastTransactionKey: data.transactionKey, // 마지막 트랜잭션 키 저장
        orderName: data.orderName,
        userId: userId, // 사용자 ID 저장
        requestedAt: new Date(data.requestedAt),
        approvedAt: new Date(data.approvedAt),
        productType: productType, // 상품 유형 저장
        receipt: data.receipt, // 영수증 정보 저장
        cashReceipt: data.cashReceipt || null, // 현금영수증 정보 저장 (nullable)
        cashReceipts: data.cashReceipts || [], // 현금영수증 발급 및 취소 이력
      });

      if (data.status !== 'completed') {
        payment.failure = {
          code: data.code,
          message: data.message,
        };
      }

      await payment.save();

      return data;
    } catch (error) {
      console.error('Error confirming payment:', error);

      // 결제 실패 시 데이터베이스에 실패 정보 저장
      const failedPayment = new Payment({
        paymentKey: paymentKey,
        orderId: orderId,
        amount: amount,
        status: 'failed',
        userId: userId,
        failure: {
          code: error.code,
          message: error.message,
        },
        productType: productType,
        requestedAt: new Date(),
      });

      await failedPayment.save();

      throw error;
    }
  }

  async getPaymentByKey(paymentKey) {
    const url = `${this.baseUrl}/payments/${paymentKey}`;
    const options = {
      method: 'GET',
      headers: {
        Authorization: this.authorization,
      },
    };

    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment by key:', error);
      throw error;
    }
  }

  async getPaymentByOrderId(orderId) {
    const url = `${this.baseUrl}/payments/orders/${orderId}`;
    const options = {
      method: 'GET',
      headers: {
        Authorization: this.authorization,
      },
    };

    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment by order ID:', error);
      throw error;
    }
  }

  async cancelPayment(paymentKey, cancelReason) {
    const url = `${this.baseUrl}/payments/${paymentKey}/cancel`;
    const options = {
      method: 'POST',
      headers: {
        Authorization: this.authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cancelReason }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      // 결제 취소 후 상태 업데이트
      await Payment.findOneAndUpdate(
        { paymentKey: paymentKey },
        {
          status: 'refunded',
          lastTransactionKey: data.transactionKey,
          cashReceipts: data.cashReceipts || [], // 취소된 현금영수증 이력 저장
          updatedAt: new Date(),
        }
      );

      return data;
    } catch (error) {
      console.error('Error canceling payment:', error);
      throw error;
    }
  }

  async createVirtualAccount(amount, orderId, orderName, userId, bank) {
    const url = `${this.baseUrl}/virtual-accounts`;
    const options = {
      method: 'POST',
      headers: {
        Authorization: this.authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        orderId,
        orderName,
        customerName: userId,
        bank,
      }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      // 가상계좌 발급 후 데이터베이스에 저장 (필요시)
      const payment = new Payment({
        paymentKey: data.paymentKey,
        orderId: data.orderId,
        amount: data.totalAmount,
        currency: data.currency,
        status: 'pending',
        method: 'virtual-account',
        orderName: orderName,
        userId: userId, // 사용자 ID 저장
        lastTransactionKey: data.transactionKey, // 마지막 트랜잭션 키 저장
        receipt: data.receipt || null, // 영수증 정보 저장 (nullable)
        cashReceipt: data.cashReceipt || null, // 현금영수증 정보 저장 (nullable)
        cashReceipts: data.cashReceipts || [], // 현금영수증 발급 및 취소 이력
        createdAt: new Date(),
      });
      await payment.save();

      return data;
    } catch (error) {
      console.error('Error creating virtual account:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
