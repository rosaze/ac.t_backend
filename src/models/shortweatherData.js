const mongoose = require('mongoose');

const weatherInfoSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // 날짜를 문자열로 저장
    temperature: Number,
    precipitationType: String,
    skyStatus: String,
    humidity: Number,
    windSpeed: Number,
    windDirection: String,
  },
  { _id: false }
);

const shortweatherDataSchema = new mongoose.Schema(
  {
    locationTag: { type: String, required: true, unique: true },
    weatherInfo: [weatherInfoSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('shortweatherData', shortweatherDataSchema);
