const ShortWeatherData = require('../models/shortweatherData');
const WeatherService = require('./weatherService');
const locationData = require('../utils/locationData');
const moment = require('moment-timezone');
const cron = require('node-cron');

class DailyShortWeatherService {
  constructor() {
    cron.schedule('0 0 * * *', async () => {
      console.log('Running daily short-term weather data fetch and save...');
      try {
        await this.fetchAndSaveAllLocationsWeather();
        console.log(
          'Daily short-term weather data fetch and save completed successfully.'
        );
      } catch (error) {
        console.error(
          'Error in daily short-term weather data fetch and save:',
          error
        );
      }
    });
  }

  async fetchAndSaveAllLocationsWeather() {
    const today = moment().tz('Asia/Seoul').format('YYYYMMDD');

    for (const location of locationData) {
      try {
        const weatherData = await WeatherService.fetchThreeDaysWeatherData(
          location.locationTag,
          today
        );

        if (
          !weatherData ||
          !Array.isArray(weatherData) ||
          weatherData.length === 0
        ) {
          console.error(
            `Failed to retrieve valid weather data for ${location.locationTag}`
          );
          continue;
        }

        const processedWeatherData = weatherData.map((dailyWeather) => {
          const seoulDate = moment.tz(
            dailyWeather.date,
            'YYYYMMDD',
            'Asia/Seoul'
          );
          return {
            date: seoulDate.format('YYYY-MM-DD'), // 날짜를 문자열로 저장
            temperature: dailyWeather.temperature,
            precipitationType: dailyWeather.precipitationType,
            skyStatus: dailyWeather.skyStatus,
            humidity: dailyWeather.humidity,
            windSpeed: dailyWeather.windSpeed,
            windDirection: dailyWeather.windDirection,
          };
        });

        await ShortWeatherData.findOneAndUpdate(
          { locationTag: location.locationTag },
          {
            locationTag: location.locationTag,
            weatherInfo: processedWeatherData,
          },
          { upsert: true, new: true }
        );

        console.log(
          `Short-term weather data saved for ${location.locationTag}:`,
          processedWeatherData.map((w) => w.date)
        );
      } catch (error) {
        console.error(
          `Error saving short-term weather data for ${location.locationTag}:`,
          error
        );
      }
    }
  }

  async manualUpdate() {
    console.log('Manually running short-term weather data fetch and save...');
    try {
      await this.fetchAndSaveAllLocationsWeather();
      console.log(
        'Manual short-term weather data fetch and save completed successfully.'
      );
    } catch (error) {
      console.error(
        'Error in manual short-term weather data fetch and save:',
        error
      );
      throw error;
    }
  }
}

module.exports = new DailyShortWeatherService();
