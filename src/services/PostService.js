//비즈니스 로직
const Post = require('../models/Posts');

class PostService {
  async createPost(data) {
    const post = new Post(data);
    return await post.save();
  }

  async getPosts() {
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
