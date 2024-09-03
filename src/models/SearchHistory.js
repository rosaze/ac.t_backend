const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  keyword: { type: String, required: true }, // 사용자가 검색한 키워드
  createdAt: { type: Date, default: Date.now }, // 검색 시간
});

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
