//상품 정보 저장
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // 액티비티별 분류
  price: { type: Number, required: true },
  imageUrl: { type: String }, // 상품 이미지 URL
  stock: { type: Number, default: 0 }, // 재고 수량
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', ProductSchema);
