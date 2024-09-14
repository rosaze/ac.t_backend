const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
  sigungu: String,
  title: String,
  category2: String,
  category3: String,
  // 기타 필요한 필드들...
});

const Accommodation = mongoose.model(
  'Accommodation',
  accommodationSchema,
  'Accommodation'
);

module.exports = Accommodation;
