const Post = require('../models/Posts');
const UserActivity = require('../models/UserActivities');
const WeatherService = require('./weatherService');
const ActivityMapService = require('../services/activityMapService');
const axios = require('axios');

class PostService {
  constructor(badgeService) {
    this.badgeService = badgeService;
  }

  async createPost(userId, data) {
    try {
      const post = new Post(data);
      await post.save();
      await this.badgeService.awardBadgeForPost(userId);
      await this.saveWeatherDataAndActivity(data, post.id);
      return post;
    } catch (error) {
      console.error('게시글 저장 중 오류:', error.message);
      throw new Error('게시글 생성 실패');
    }
  }

  async saveWeatherDataAndActivity(postData, postId) {
    try {
      const weatherData = await WeatherService.fetchThreeDaysWeatherData(
        postData.locationTag,
        postData.date
      );
      if (!weatherData) {
        throw new Error('Failed to retrieve weather data');
      }

      const activityMapData = {
        user: postData.author,
        post: postId,
        region: postData.locationTag,
        activity_date: postData.date,
        activityTag: postData.activityTag,
      };
      await ActivityMapService.addActivityMap(activityMapData);

      const userActivity = new UserActivity({
        postId,
        location: postData.locationTag,
        date: postData.date,
        weather: weatherData,
        activityTag: postData.activityTag,
      });

      await userActivity.save();
    } catch (error) {
      console.error('Error saving user activity:', error);
      throw error;
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

  async getSortedPosts(sortBy) {
    // Implement sorting logic based on sortBy parameter
    let sortOption = {};
    if (sortBy === 'likes') {
      sortOption = { likes: -1 };
    } else if (sortBy === 'date') {
      sortOption = { createdAt: -1 };
    }
    return await Post.find().sort(sortOption).exec();
  }

  async getFilteredPosts(filters) {
    const query = {};
    if (filters.location) query.locationTag = filters.location;
    if (filters.activity) query.activityTag = filters.activity;
    if (filters.vendor) query.vendorTag = filters.vendor;
    return await Post.find(query).exec();
  }

  async searchPosts(keyword) {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedKeyword, 'i');
    return await Post.find({
      $or: [
        { hashtags: regex },
        { title: regex },
        { content: regex },
        { locationTag: regex },
        { activityTag: regex },
        { vendorTag: regex },
      ],
    }).exec();
  }

  async getPosts(type) {
    const query = type ? { type } : {};
    return await Post.find(query).populate('author').exec();
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

  async summarizePostContent(postId) {
    const post = await this.getPostById(postId);
    const summary = await this.summarizeContent(post.content);
    return {
      original: post.content,
      summary: summary,
    };
  }

  async summarizeContent(content) {
    const REST_API_KEY = process.env.KAKAO_CLIENT_ID;
    const prompt = `'''${content}'''\n\n한줄 요약:`;

    try {
      const response = await axios.post(
        'https://api.kakaobrain.com/v1/inference/kogpt/generation',
        {
          prompt: prompt,
          max_tokens: 64,
          temperature: 0.5,
          top_p: 0.9,
          n: 1,
        },
        {
          headers: {
            Authorization: `KakaoAK ${REST_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const generatedText = response.data.generations[0].text.trim();

      if (generatedText && generatedText.length > 0) {
        return generatedText;
      } else {
        throw new Error('Failed to generate a valid summary.');
      }
    } catch (error) {
      console.error('Error summarizing content using KoGPT:', error.message);
      throw new Error('Failed to summarize content using KoGPT');
    }
  }

  // PostService.js
  async analyzeSentiments(locationTag, activityTag, vendorTag) {
    console.log('Analyzing sentiments for:', {
      locationTag,
      activityTag,
      vendorTag,
    });

    const query = {};
    if (locationTag) query.locationTag = locationTag;
    if (activityTag) query.activityTag = activityTag;
    if (vendorTag) query.vendorTag = vendorTag;
    console.log('Query:', query);

    const posts = await Post.find(query).exec();
    console.log(`Found ${posts.length} posts`);

    if (posts.length === 0) {
      return { message: '해당 장소, 활동, 업체에 대한 게시물이 없습니다.' };
    }

    let positiveCount = 0;
    let negativeCount = 0;

    const sentiments = await Promise.all(
      posts.map(async (post) => {
        const sentiment = await this.analyzeSentiment(post.content);
        console.log(`Post ${post._id}: ${sentiment}`);
        if (sentiment === '긍정') {
          positiveCount++;
        } else if (sentiment === '부정') {
          negativeCount++;
        }
        return { postId: post.id, sentiment };
      })
    );

    const finalSentiment = positiveCount >= negativeCount ? '긍정' : '부정';

    const result = {
      finalSentiment,
      positiveCount,
      negativeCount,
      totalPosts: posts.length,
      details: sentiments,
    };
    console.log('Final analysis result:', result);

    return result;
  }

  async analyzeSentiment(content) {
    const REST_API_KEY = process.env.KAKAO_CLIENT_ID;
    const prompt = `다음 글을 긍정 또는 부정으로 분류합니다.\n"${content}"`;

    try {
      const response = await axios.post(
        'https://api.kakaobrain.com/v1/inference/kogpt/generation',
        {
          prompt: prompt,
          max_tokens: 1,
          temperature: 0.4,
          top_p: 0.8,
          n: 1,
        },
        {
          headers: {
            Authorization: `KakaoAK ${REST_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data.generations[0].text.trim();
      console.log('KoGPT sentiment analysis result:', result);
      return result;
    } catch (error) {
      console.error('Error analyzing sentiment using KoGPT:', error.message);
      throw new Error('Failed to analyze sentiment using KoGPT');
    }
  }
  async likePost(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.likedBy.includes(userId)) {
      throw new Error('User already liked this post');
    }

    post.likes += 1;
    post.likedBy.push(userId);
    await post.save();
    return post;
  }

  async unlikePost(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    if (!post.likedBy.includes(userId)) {
      throw new Error('User has not liked this post');
    }

    post.likes -= 1;
    post.likedBy = post.likedBy.filter(
      (id) => id.toString() !== userId.toString()
    );
    await post.save();
    return post;
  }
}

module.exports = PostService;
