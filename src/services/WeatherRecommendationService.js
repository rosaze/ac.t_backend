const apiClient = require('../utils/apiClient');

class WeatherRecommendationService {
  async getRecommendationByLocation(location) {
    try {
      console.log(`Requesting recommendation for location: ${location}`);
      const response = await apiClient.post('/recommend/by_location', {
        location,
      });
      console.log(`Received recommendation:`, response.data);
      return response.data;
    } catch (error) {
      console.error(
        'Error getting recommendation by location:',
        error.response?.data || error.message
      );
      return { recommended_activities: [] };
    }
  }

  async getRecommendationByActivity(activity) {
    try {
      console.log(`Requesting recommendation for activity: ${activity}`);
      const response = await apiClient.post('/recommend/by_activity', {
        activity,
      });
      console.log(`Received recommendation:`, response.data);
      return response.data;
    } catch (error) {
      console.error(
        'Error getting recommendation by activity:',
        error.response?.data || error.message
      );
      return { recommended_activities: [] };
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

  async getRecommendedDatesForActivityAndLocation(activity, location) {
    try {
      const response = await apiClient.post(
        '/recommend/by_activity_and_location',
        {
          activity,
          location,
        }
      );

      const recommendedDates = response.data.recommended_dates.map((date) => {
        // 문자열에서 날짜와 점수 추출
        const [dateStr, scoreStr] = date.slice(1, -1).split(', ');
        return {
          date: dateStr.slice(1, -1), // 따옴표 제거
          score: parseFloat(scoreStr),
        };
      });

      const currentDate = new Date().toISOString().split('T')[0];
      const currentScore =
        recommendedDates.find((date) => date.date === currentDate)?.score || 0;

      return { recommendedDates, currentScore };
    } catch (error) {
      console.error('Error getting recommended dates:', error);
      return { recommendedDates: [], currentScore: 0 };
    }
  }
}

module.exports = new WeatherRecommendationService();
