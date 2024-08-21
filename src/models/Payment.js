//결제 정보 저장 (결제 ID, 결제 상태, 결제 금액, 결제 수단)
const mongoose = require('mongoose');

const CashReceiptSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['소득공제', '지출증빙'], required: true }, // 현금영수증의 종류
    receiptKey: { type: String, required: true }, // 현금영수증의 키 값
    issueNumber: { type: String, maxlength: 9 }, // 현금영수증 발급 번호
    receiptUrl: { type: String }, // 발행된 현금영수증 URL
    amount: { type: Number, required: true }, // 현금영수증 처리된 금액
    taxFreeAmount: { type: Number }, // 면세 처리된 금액
    transactionType: {
      type: String,
      enum: ['CONFIRM', 'CANCEL'],
      required: true,
    }, // 발급(CONFIRM), 취소(CANCEL) 구분
    issueStatus: {
      type: String,
      enum: ['IN_PROGRESS', 'COMPLETED', 'FAILED'],
      default: 'IN_PROGRESS',
    }, // 현금영수증 발급 상태
    failure: {
      code: String, // 오류 코드
      message: String, // 오류 메시지
    },
    customerIdentityNumber: { type: String, maxlength: 30 }, // 소비자 인증수단
    requestedAt: { type: String }, // 요청 시각 (ISO 8601 형식)
  },
  { _id: false }
); // _id 필드 자동 생성 비활성화

const PaymentSchema = new mongoose.Schema({
  paymentKey: { type: String, required: true }, // 결제 키
  orderId: { type: String, required: true }, // 주문 ID
  amount: { type: Number, required: true }, // 결제 금액
  currency: { type: String, default: 'KRW' }, // 통화, 기본값은 'KRW'
  status: {
    type: String,
    enum: ['pending', 'completed', 'refunded', 'failed'],
    default: 'pending',
  }, // 결제 상태
  method: { type: String, required: true }, // 결제 수단 (카드, 가상계좌 등)
  transactionId: { type: String }, // 결제 트랜잭션 ID (API 응답에 포함된 경우)
  lastTransactionKey: { type: String }, // 마지막 결제 트랜잭션 키
  orderName: { type: String, required: true }, // 주문 이름 (예: 장비 구매, 티켓 구매 등)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 사용자 ID (User 모델과 연동)
  requestedAt: { type: Date, required: true }, // 결제 요청 시간
  approvedAt: { type: Date }, // 결제 승인 시간
  rentalDuration: { type: Number }, // 렌탈 기간 (장비 렌탈 시)
  productType: { type: String, required: true }, // 상품 유형 (구매, 렌탈, 티켓)
  receipt: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  }, // 영수증 정보 (nullable)
  cashReceipt: {
    type: CashReceiptSchema,
    default: null,
  }, // 현금영수증 정보 (nullable)
  cashReceipts: [CashReceiptSchema], // 현금영수증 발급 및 취소 이력
  failure: {
    code: String,
    message: String,
    default: null,
  }, // 결제 실패 정보 (nullable)
});

module.exports = mongoose.model('Payment', PaymentSchema);
