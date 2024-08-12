// 비즈니스 로직
const Post = require('../models/Posts');
const axios = require('axios');

class PostService {
  async createPost(data) {
    const post = new Post(data);
    return await post.save();
  }
  //좋아요수로 내림차순
  async getTopPosts() {
    return await Post.find()
      .sort({ likes: -1 })
      .limit(5)
      .populate('author')
      .exec();
  }

  async getPostsByType(type) {
    //게시판 분류
    return await Post.find({ type }).populate('author').exec();
  }
  async getPostsByCategory(category) {
    // 태그 분류
    return await Post.find({ category }).populate('author').exec();
  }
  async getPostsByTag(tag) {
    // 특정 태그 가진 게시물 가져옴
    return await Post.find({ hashtags: tag }).populate('author').exec();
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

  async getPosts() {
    const query =
      type == 'review'
        ? { rating: { $exists: true } }
        : { rating: { $exists: false } };
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
    const summary = await this.callKoGPTForSummary(post.content);
    return {
      original: post.content,
      summary: summary,
    };
  }

  // KoGPT API 호출 메소드
  async callKoGPTForSummary(content) {
    const REST_API_KEY = process.env.KAKAO_CLIENT_ID; // 환경 변수에서 REST API 키를 가져옴
    const prompt = `다음 글을 요약해 주세요: ${content}`;

    try {
      const response = await axios.post(
        'https://api.kakaobrain.com/v1/inference/kogpt/generation',
        {
          prompt: prompt,
          max_tokens: 100,
          temperature: 0.7,
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
      console.error('Error calling KoGPT API:', error.message);
      throw new Error('Failed to summarize content using KoGPT');
    }
  }
}

module.exports = new PostService();
