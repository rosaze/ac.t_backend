const Post = require('../models/Posts');
const BadgeService = require('./badgeService');

class PostService {
  async createPost(userId, postData) {
    // 게시글 작성 로직
    const post = new Post(postData);
    await post.save();

    // 게시글 작성 시 배지 지급
    await BadgeService.awardBadgeForPost(userId);

    return post;
  }

  // 좋아요수로 내림차순
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
