const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the forecast data
const forecastSchema = new Schema({
  city: String,
  temperature: [
    {
      day: Number,
      min: Number,
      max: Number,
    },
  ],
  landForecast: [
    {
      day: Number,
      morning: String,
      evening: String,
      rainMorning: Number,
      rainEvening: Number,
    },
  ],
  seaForecast: [
    {
      day: Number,
      morning: String,
      evening: String,
    },
  ],
  updatedAt: { type: Date, default: Date.now }, // Timestamp for when the data was saved
});

const Forecast = mongoose.model('Forecast', forecastSchema);
module.exports = Forecast;
