//상품 정보 저장
const mongoose = require('mongoose');
const loadCategories = require('../utils/categoryLoader');

const categories = loadCategories();

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 상품 이름
  description: { type: String }, // 상품 설명
  price: { type: Number, required: true }, // 상품 가격
  stock: { type: Number, required: true, default: 0 }, // 재고 수량
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 판매자 ID
  category: {
    type: String,
    enum: categories.productCategories,
    required: true,
  }, // JSON에서 로드된 상품 카테고리
  createdAt: { type: Date, default: Date.now }, // 상품 등록일
  updatedAt: { type: Date, default: Date.now }, // 상품 수정일
});

module.exports = mongoose.model('Product', ProductSchema);
