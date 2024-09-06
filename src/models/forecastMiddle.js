const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the weather schema
const forecastMiddleSchema = new Schema({
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
  updatedAt: { type: Date, default: Date.now }, // Timestamp to track updates
});

// Create a Weather model

module.exports = mongoose.model('forecastMiddle', forecastMiddleSchema);
