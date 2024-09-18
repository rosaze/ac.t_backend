const apiClient = require('../utils/apiClient');

class WeatherRecommendationService {
  async getRecommendationByLocation(location) {
    try {
      const response = await apiClient.post('/recommend/by_location', {
        location,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting recommendation by location:', error);
      throw error;
    }
  }

  async getRecommendationByDate(date) {
    try {
      const response = await apiClient.post('/recommend/by_date', { date });
      return response.data;
    } catch (error) {
      console.error('Error getting recommendation by date:', error);
      throw error;
    }
  }

  async getRecommendationByKeyword(keyword) {
    try {
      const response = await apiClient.post('/recommend/by_keyword', {
        keyword,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting recommendation by keyword:', error);
      throw error;
    }
  }

  async getRecommendationByKeywordAndLocation(keyword, location) {
    try {
      const response = await apiClient.post(
        '/recommend/by_keyword_and_location',
        { keyword, location }
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error getting recommendation by keyword and location:',
        error
      );
      throw error;
    }
  }

  async getRecommendationByKeywordAndDate(keyword, date) {
    try {
      const response = await apiClient.post('/recommend/by_keyword_and_date', {
        keyword,
        date,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting recommendation by keyword and date:', error);
      throw error;
    }
  }

  async getRecommendationByLocationAndDate(location, date) {
    try {
      const response = await apiClient.post('/recommend/by_location_and_date', {
        location,
        date,
      });
      return response.data;
    } catch (error) {
      console.error(
        'Error getting recommendation by location and date:',
        error
      );
      throw error;
    }
  }

  async getRecommendationByAll(keyword, location, date) {
    try {
      const response = await apiClient.post('/recommend/by_all', {
        keyword,
        location,
        date,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting recommendation by all parameters:', error);
      throw error;
    }
  }
}

module.exports = new WeatherRecommendationService();
