// 비즈니스 로직
const Post = require('../models/Posts');

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
}

module.exports = new PostService();
