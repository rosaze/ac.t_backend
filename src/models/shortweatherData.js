const mongoose = require('mongoose');

const shortweatherDataSchema = new mongoose.Schema(
  {
    locationTag: { type: String, required: true },
    date: { type: Date, required: true },
    weather: Object, // 날씨 데이터
  },
  { timestamps: true }
);

module.exports = mongoose.model('shortweatherData', shortweatherDataSchema);
