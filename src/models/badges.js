const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  icon_url: {
    type: String,
  },
  condition: {
    type: String,
    required: true,
  }, // 배지 지급 조건 추가
});

module.exports = mongoose.model('Badge', badgeSchema);
