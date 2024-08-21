const mongoose = require('mongoose');
const loadCategories = require('../utils/categoryLoader');

const categories = loadCategories();

const RentalItemSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 렌탈 장비 이름
  description: { type: String }, // 렌탈 장비 설명
  dailyRentalPrice: { type: Number, required: true }, // 하루당 렌탈 가격
  stock: { type: Number, required: true, default: 0 }, // 재고 수량
  category: { type: String, enum: categories.rentalCategories, required: true }, // JSON에서 로드된 렌탈 카테고리
});

const RentalSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }, // 렌탈 업체 ID
  items: [RentalItemSchema], // 렌탈 장비 목록
  location: { type: String, required: true }, // 렌탈 업체 위치
  contactInfo: { type: String }, // 렌탈 업체 연락처
  createdAt: { type: Date, default: Date.now }, // 렌탈 정보 등록일
  updatedAt: { type: Date, default: Date.now }, // 렌탈 정보 수정일
});

module.exports = mongoose.model('Rental', RentalSchema);
