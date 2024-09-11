const Post = require('../models/Posts');
const UserActivity = require('../models/UserActivities');
const WeatherService = require('./weatherService');
const ShortWeatherData = require('../models/shortweatherData');

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
      const weatherData = await WeatherService.fetchThreeDaysWeatherData(
        postData.locationTag,
        postData.date
      );
      if (!weatherData) {
        throw new Error('Failed to retrieve weather data');
      }

      try {
        const activityMapData = {
          user: postData.author,
          post: postId,
          region: postData.locationTag, // 시군 정보
          activity_date: postData.date, // 활동 날짜
          activityTag: postData.activityTag, // 활동 태그
        };
        const activityMap = await ActivityMapService.addActivityMap(
          activityMapData
        );
        console.log('Activity map saved successfully:', activityMap);
      } catch (error) {
        console.error('Error saving activity map:', error.message);
      }

      // UserActivity에 날씨 데이터 저장
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

  // KoGPT를 사용하여 게시글 내용 요약
  async summarizePostContent(postId) {
    const post = await this.getPostById(postId);
    const summary = await this.summarizeContent(post.content);
    return {
      original: post.content,
      summary: summary,
    };
  }

  // 요약 로직
  async summarizeContent(content) {
    const REST_API_KEY = process.env.KAKAO_CLIENT_ID; // 환경 변수에서 REST API 키를 가져옴

    // 주어진 프롬프트 형식에 맞춰 수정
    const prompt = `'''${content}'''\n\n한줄 요약:`;

    try {
      const response = await axios.post(
        'https://api.kakaobrain.com/v1/inference/kogpt/generation',
        {
          prompt: prompt,
          max_tokens: 64, // 요약이 한 줄에 수렴할 수 있도록 토큰 수 설정
          temperature: 0.5, // 적절한 다양성을 유지하면서 정확성을 높임
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

      // 요약이 예상치 못한 결과를 줄 경우 처리
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

  // 장소, 활동, 업체 해시태그를 통해 후기 데이터베이스 가져와 각 게시물의 내용을 analyzeSentiment 메서드로 전달하여 감정을 분석
  // 분석 결과에 따라 긍정/부정 게시물의 수 집계
  async analyzeSentiments(locationTag, activityTag, vendorTag) {
    const posts = await Post.find({
      locationTag,
      activityTag,
      vendorTag,
    }).exec();

    if (posts.length === 0) {
      return { message: '해당 장소, 활동, 업체에 대한 게시물이 없습니다.' };
    }

    let positiveCount = 0;
    let negativeCount = 0;

    const sentiments = await Promise.all(
      posts.map(async (post) => {
        const sentiment = await this.analyzeSentiment(post.content);
        if (sentiment === '긍정') {
          positiveCount++;
        } else if (sentiment === '부정') {
          negativeCount++;
        }
        return { postId: post._id, sentiment };
      })
    );

    const finalSentiment = positiveCount >= negativeCount ? '긍정' : '부정';

    return {
      finalSentiment, // 집계 결과
      positiveCount, // 긍정 게시물 개수
      negativeCount, // 부정 게시물 개수
      totalPosts: posts.length, // 총 게시물 수
      details: sentiments,
    };
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

      return response.data.generations[0].text.trim();
    } catch (error) {
      console.error('Error analyzing sentiment using KoGPT:', error.message);
      throw new Error('Failed to analyze sentiment using KoGPT');
    }
  }
}

module.exports = PostService;
