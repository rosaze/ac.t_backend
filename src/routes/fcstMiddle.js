// In app.js or a new test route file
const express = require('express');
const fetchAndSaveForecasts = require('../forecastM.js');
const router = express.Router();

// Test route to trigger the forecast function manually
router.get('/api/test/forecast', async (req, res) => {
  try {
    await fetchAndSaveForecasts();
    res
      .status(200)
      .json({ message: 'Weather data fetched and saved successfully.' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch and save weather data.',
      error: error.message,
    });
  }
});

module.exports = router;
