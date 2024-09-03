// 비즈니스 로직
const Post = require('../models/Posts');
const BadgeService = require('../models/Posts');
const axios = require('axios');

require('dotenv').config();

class PostService {
  async createPost(data) {
    const post = new Post(data);
    await post.save();

    //게시글 작성 횟수 추적 및 배지 지급
    const postCount = await Post.countDocuments({ author: data.author });
    if (postCount >= 5) {
      await BadgeService.awardBadge(data.author, '아낌없이 주는 나무');
    }

    return post;
  }
  //좋아요수로 내림차순
  async getTrendingPosts() {
    const trendingPosts = await Post.find() //모든게시물 중에서
      .sort({ likes: -1 }) // 좋아요 수 기준으로 내림차순 정렬
      .limit(10)
      .populate('author'); //?
    return trendingPosts;
  }

  async getPostsByType(type) {
    //후기글과 일반 게시글 분류
    return await Post.find({ type }).populate('author').exec();
  }
  async getPostsByCategory(category) {
    // 태그 분류 ? 카테고리가 뭐지???ㅅㅂ일단 나중에 확인
    return await Post.find({ category }).populate('author').exec();
  }
  async getPostsByTag(tag) {
    // 특정 태그 가진 게시물 가져옴?
    return await Post.find({ hashtags: tag }).populate('author').exec();
  }
  //좋아요순 아님 최신순 드롭다운 (New!)
  async getPostsSortedBy(option) {
    let sortOption;
    if (option === 'latest') {
      sortOption = { createdAt: -1 }; // 최신순
    } else if (option === 'likes') {
      sortOption = { likes: -1 }; // 좋아요 순
    }

    const posts = await Post.find({}).sort(sortOption).exec();
    return posts;
  }
  async getSortedPosts(sortBy) {
    // 게시물 정렬
    let sortCriteria;
    switch (sortBy) {
      case 'city':
        sortCriteria = { city: 1 };
        break;
      case 'activity':
        sortCriteria = { activity: 1 };
        break;
      case 'likes':
        sortCriteria = { likes: -1 };
        break;
      default:
        sortCriteria = {};
    }
    return await Post.find().sort(sortCriteria).populate('author').exec();
  }

  //후기 게시판 필터 기능- 필터링 옵션: 장소, 액티비티, 업체 해시태그 선택
  //해당 필터에 맞는 게시물만 표시 . !!!일단 업체는 뺄 수도 있음!!
  async getFilteredPosts(filters) {
    const query = {};
    if (filters.location) query['hashtags.location'] = filters.location;
    if (filters.activity) query['hashtags.activity'] = filters.activity;
    if (filters.vendor) query['hashtags.vendor'] = filters.vendor;

    const filteredPosts = await Post.find(query).exec();
    return filteredPosts;
  }

  //후기 검색 기능 - 사용자가 키워드 입력하면 일치하는 게시물 반환
  //후기 게시판에서만 있는 기능
  //자유 게시판: 후기 게시판과 동일하게 구현. 필터링 기능은 없음
  async searchPosts(keyword) {
    const searchResults = await Post.find({
      $or: [
        //해시태그, 본문, 제목 모두 검색
        { 'hashtags.location': new RegExp(keyword, 'i') },
        { 'hashtags.activity': new RegExp(keyword, 'i') },
        { 'hashtags.vendor': new RegExp(keyword, 'i') },
        { title: new RegExp(keyword, 'i') },
        { content: new RegExp(keyword, 'i') },
      ],
    }).exec();
    return searchResults;
  }

  async getPosts(type) {
    const query =
      type === 'review'
        ? { rating: { $exists: true } } // 리뷰 게시물만
        : type === 'general'
        ? { rating: { $exists: false } } // 일반 게시물만
        : {}; // 모든 게시물
    return await Post.find().populate('author').exec();
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

  // 장소, 활동 해시태그를 통해 후기 데이터베이스 가져와 각 게시물의 내용을 analyzeSentiment 메서드로 전달하여 감정을 분석
  // 분석 결과에 따라 긍정/부정 게시물의 수 집계
  async analyzeSentiments(locationTag, activityTag, vendorTag) {
    const posts = await Post.find({
      locationTag,
      activityTag,
      vendorTag,
    }).exec();

    if (posts.length === 0) {
      return { message: '해당 장소와 활동에 대한 게시물이 없습니다.' };
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
      finalSentiment, //집계 결과
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

module.exports = new PostService();
