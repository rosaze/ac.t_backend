//장바구니 모델
const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // 구매 상품 ID
  rental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental' }, // 렌탈 상품 ID
  quantity: { type: Number, required: true }, // 상품 수량
  rentalPeriod: { type: String }, // 렌탈 기간
  totalPrice: { type: Number, required: true }, // 렌탈 기간에 따른 총 가격
});

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 사용자 ID
  items: [CartItemSchema], // 장바구니에 담긴 상품들
  updatedAt: { type: Date, default: Date.now }, // 장바구니 수정일
});

module.exports = mongoose.model('Cart', CartSchema);
