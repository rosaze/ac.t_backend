const apiClient = require('../utils/apiClient');

const cache = new Map();
const CACHE_DURATION = 3600000; // 1시간 (밀리초 단위)

class WeatherRecommendationService {
  async getRecommendationByLocation(location) {
    const cacheKey = `location:${location}`;
    if (this.isCacheValid(cacheKey)) {
      return cache.get(cacheKey).data;
    }

    try {
      console.log(`Requesting recommendation for location: ${location}`);
      const response = await apiClient.post('/recommend/by_location', {
        location,
      });
      console.log(`Received recommendation:`, response.data);
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting recommendation by location:', error.message);
      return { recommended_activities: [], recommended_dates: {} };
    }
  }

  async getRecommendationByActivity(activity) {
    const cacheKey = `activity:${activity}`;
    if (this.isCacheValid(cacheKey)) {
      return cache.get(cacheKey).data;
    }

    try {
      console.log(`Requesting recommendation for activity: ${activity}`);
      const response = await apiClient.post('/recommend/by_activity', {
        activity,
      });
      console.log(`Received recommendation:`, response.data);
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting recommendation by activity:', error.message);
      return { recommended_activities: [], recommended_dates: {} };
    }
  }

  async getRecommendationByDate(date) {
    const cacheKey = `date:${date}`;
    if (this.isCacheValid(cacheKey)) {
      return cache.get(cacheKey).data;
    }

    try {
      const response = await apiClient.post('/recommend/by_date', { date });
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting recommendation by date:', error);
      return { recommended_activities: [], recommended_dates: {} };
    }
  }

  async getRecommendationByKeyword(keyword) {
    const cacheKey = `keyword:${keyword}`;
    if (this.isCacheValid(cacheKey)) {
      return cache.get(cacheKey).data;
    }

    try {
      const response = await apiClient.post('/recommend/by_keyword', {
        keyword,
      });
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting recommendation by keyword:', error);
      return { recommended_activities: [], recommended_dates: {} };
    }
  }

  async getRecommendationByKeywordAndLocation(keyword, location) {
    const cacheKey = `keyword_location:${keyword}_${location}`;
    if (this.isCacheValid(cacheKey)) {
      return cache.get(cacheKey).data;
    }

    try {
      const response = await apiClient.post(
        '/recommend/by_keyword_and_location',
        { keyword, location }
      );
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(
        'Error getting recommendation by keyword and location:',
        error
      );
      return { recommended_activities: [], recommended_dates: {} };
    }
  }

  async getRecommendationByKeywordAndDate(keyword, date) {
    const cacheKey = `keyword_date:${keyword}_${date}`;
    if (this.isCacheValid(cacheKey)) {
      return cache.get(cacheKey).data;
    }

    try {
      const response = await apiClient.post('/recommend/by_keyword_and_date', {
        keyword,
        date,
      });
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting recommendation by keyword and date:', error);
      return { recommended_activities: [], recommended_dates: {} };
    }
  }

  async getRecommendationByLocationAndDate(location, date) {
    const cacheKey = `location_date:${location}_${date}`;
    if (this.isCacheValid(cacheKey)) {
      return cache.get(cacheKey).data;
    }

    try {
      const response = await apiClient.post('/recommend/by_location_and_date', {
        location,
        date,
      });
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(
        'Error getting recommendation by location and date:',
        error
      );
      return { recommended_activities: [], recommended_dates: {} };
    }
  }

  async getRecommendedDatesForActivityAndLocation(activity, location) {
    const cacheKey = `activity_location:${activity}_${location}`;
    if (this.isCacheValid(cacheKey)) {
      return cache.get(cacheKey).data;
    }

    try {
      const response = await apiClient.post(
        '/recommend/by_activity_and_location',
        { activity, location }
      );
      const recommendedDates = response.data.recommended_dates.map((date) => {
        const [dateStr, scoreStr] = date.slice(1, -1).split(', ');
        return {
          date: dateStr.slice(1, -1),
          score: parseFloat(scoreStr),
        };
      });

      const currentDate = new Date().toISOString().split('T')[0];
      const currentScore =
        recommendedDates.find((date) => date.date === currentDate)?.score || 0;

      const result = { recommendedDates, currentScore };
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error getting recommended dates:', error);
      return { recommendedDates: [], currentScore: 0 };
    }
  }

  isCacheValid(key) {
    if (cache.has(key)) {
      const cacheEntry = cache.get(key);
      return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
    }
    return false;
  }

  setCache(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
  }
}

module.exports = new WeatherRecommendationService();
