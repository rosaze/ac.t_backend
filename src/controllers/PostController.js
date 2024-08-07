const PostService = require('../services/PostService');

//http 요청 처리
class PostController {
  async createPost(req, res) {
    try {
      const post = await PostService.createPost(req.body);
      res.status(201).json(post);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getPosts(req, res) {
    try {
      const posts = await PostService.getPosts();
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getPostById(req, res) {
    try {
      const post = await PostService.getPostById(req.params.id);
      res.status(200).json(post);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async updatePost(req, res) {
    try {
      const post = await PostService.updatePost(req.params.id, req.body);
      res.status(200).json(post);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async deletePost(req, res) {
    try {
      await PostService.deletePost(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new PostController();
