const Post = require('../models/Posts');
const BadgeService = require('./badgeService');
const UserActivity = require('../models/UserActivities');
const ActivityMapService = require('./activityMapService'); // 경로 맞게 수정
const WeatherService = require('./weatherService'); // WeatherService 사용

const axios = require('axios');

require('dotenv').config();

class PostService {
  async createPost(userId, data) {
    // 날씨 데이터를 추가하지 않고, 순수하게 후기 관련 정보만 저장
    const post = new Post(data);

    await post.save();

    console.log('Post created with ID:', post._id);
    console.log('Post data saved:', post); // 게시물 전체 데이터 출력

    // 게시글 작성 시 배지 지급(지금 이 부분 오류남 )
    await BadgeService.awardBadgeForPost(userId);

    return post;
  }
  catch(error) {
    console.error('Error saving post:', error.message);
    throw new Error('Post creation failed');
  }

  // 새로운 메서드: 날씨 데이터를 가져오고 user_activities에 저장
  async saveWeatherDataAndActivity(postData, postId) {
    try {
      const weatherData = await WeatherService.fetchWeatherData(
        postData.locationTag,
        postData.date
      );
      // 날씨 데이터가 제대로 받아졌는지 확인
      if (!weatherData) {
        throw new Error('Failed to retrieve weather data');
      }

      const userActivity = new UserActivity({
        postId,
        location: postData.locationTag,
        date: postData.date,
        weather: weatherData,
        activityTag: postData.activityTag,
      });

      await userActivity.save();
      console.log('User activity saved successfully:', userActivity);
    } catch (error) {
      console.error(
        'Error saving weather data and user activity:',
        error.message
      );
    }
  }

  // 날씨 데이터를 가져오는 메서드
  async fetchWeatherData(nx, ny, date) {
    try {
      const response = await axios.get(
        'http://example-weather-api.com/forecast',
        {
          params: { nx, ny, date },
        }
      );

      return response.data; // 날씨 데이터 반환
    } catch (error) {
      console.error('Error fetching weather data:', error.message);
      return null;
    }
  }

  //좋아요수로 내림차순
  async getTrendingPosts() {
    const trendingPosts = await Post.find() // 모든 게시물 중에서
      .sort({ likes: -1 }) // 좋아요 수 기준으로 내림차순 정렬
      .limit(10)
      .populate('author');
    return trendingPosts;
  }

  // 태그, 카테고리, 필터링 관련 메서드
  async getPostsByType(type) {
    return await Post.find({ type }).populate('author').exec();
  }

  async getPostsByCategory(category) {
    return await Post.find({ category }).populate('author').exec();
  }

  async getPostsByTag(tag) {
    return await Post.find({ hashtags: tag }).populate('author').exec();
  }

  async getPostsSortedBy(option) {
    let sortOption;
    if (option === 'latest') {
      sortOption = { createdAt: -1 }; // 최신순
    } else if (option === 'likes') {
      sortOption = { likes: -1 }; // 좋아요 순
    }

    return await Post.find({}).sort(sortOption).exec();
  }

  async searchPosts(keyword) {
    const searchResults = await Post.find({
      $or: [
        { hashtags: new RegExp(keyword, 'i') }, // 해시태그 배열에서 검색
        { title: new RegExp(keyword, 'i') }, // 제목에서 검색
        { content: new RegExp(keyword, 'i') }, // 본문에서 검색
      ],
    }).exec();
    return searchResults;
  }

  async getPostById(id) {
    return await Post.findById(id).populate('author').exec();
  }

  async updatePost(id, data) {
    return await Post.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deletePost(id) {
    return await Post.findByIdAndDelete(id).exec();
  }
}

module.exports = new PostService();
