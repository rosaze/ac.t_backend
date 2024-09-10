const Post = require('../models/Posts');
const BadgeService = require('./badgeService');
const UserActivity = require('../models/UserActivities');
const WeatherService = require('./weatherService');

class PostService {
  constructor(badgeService) {
    this.badgeService = badgeService; // badgeService를 외부에서 주입받음
  }

  async createPost(userId, data) {
    try {
      const post = new Post(data);
      await post.save();

      console.log('생성된 게시글 ID:', post._id);
      console.log('저장된 게시글 데이터:', post);

      // 게시글 작성 시 배지 지급
      await this.badgeService.awardBadgeForPost(userId);

      return post;
    } catch (error) {
      console.error('게시글 저장 중 오류:', error.message);
      throw new Error('게시글 생성 실패');
    }
  }

  async saveWeatherDataAndActivity(postData, postId) {
    try {
      const weatherData = await WeatherService.fetchWeatherData(
        postData.locationTag,
        postData.date
      );
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

  async getTrendingPosts() {
    return await Post.find().sort({ likes: -1 }).limit(10).populate('author');
  }

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
    const sortOption = option === 'latest' ? { createdAt: -1 } : { likes: -1 };
    return await Post.find({}).sort(sortOption).exec();
  }

  async searchPosts(keyword) {
    return await Post.find({
      $or: [
        { hashtags: new RegExp(keyword, 'i') },
        { title: new RegExp(keyword, 'i') },
        { content: new RegExp(keyword, 'i') },
      ],
    }).exec();
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

module.exports = PostService;
