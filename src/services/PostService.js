const Post = require('../models/Posts');
const BadgeService = require('./badgeService');
const UserActivity = require('../models/UserActivities');
const ActivityMapService = require('./activityMapService'); // 경로 맞게 수정
const { fetchWeatherData } = require('../services/weatherService'); // 올바르게 가져오기
const WeatherService = require('./weatherService'); // WeatherService 사용

const axios = require('axios');

require('dotenv').config();

class PostService {
  async createPost(data) {
    // 날씨 데이터 가져오기
    // 이미 data에 nx, ny가 있다면 좌표 변환을 건너뜁니다.
    if (!data.nx || !data.ny) {
      const { nx, ny } = WeatherService.getCoordinates(data.locationTag);
      data.nx = nx;
      data.ny = ny;
    }
    const weatherData = await WeatherService.fetchWeatherData(data.nx, data.ny);
    data.weather = weatherData; // 날씨 데이터를 포함
    //게시물 생성
    const post = new Post(data);
    await post.save();

    // 게시글 작성 시 배지 지급
    await BadgeService.awardBadgeForPost(userId);

    return post;
  }

  // 새로운 메서드: 날씨 데이터를 가져오고 user_activities에 저장
  async saveWeatherDataAndActivity(postData, postId) {
    try {
      // 1. 날씨 데이터를 가져옴
      const weatherData = await WeatherService.fetchWeatherData(
        postData.nx,
        postData.ny,
        postData.date
      );

      // 2. Post 모델에 날씨 데이터를 추가로 업데이트
      await Post.findByIdAndUpdate(postId, { weather: weatherData });

      // 3. user_activities 컬렉션에 날씨와 함께 사용자 활동을 저장
      const userActivity = new UserActivity({
        postId,
        title: postData.title,
        content: postData.content,
        location: postData.locationTag,
        date: postData.date,
        weather: weatherData, // 날씨 데이터 저장
        author: postData.author,
        activityTag: postData.activityTag,
        vendorTag: postData.vendorTag,
      });

      await userActivity.save();
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
