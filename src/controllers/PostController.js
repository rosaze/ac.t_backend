const PostService = require('../services/PostService');
class PostController {
  async createPost(req, res) {
    try {
      const post = await PostService.createPost(req.body);
      res.status(201).json(post);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  //인기 급상승 게시물
  async getTopPosts(req, res) {
    try {
      const posts = await PostService.getTopPosts();
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  //후기글과 일반 게시글 분류
  async getPostsByType(req, res) {
    try {
      const { type } = req.params; // "review" or "general"
      const posts = await PostService.getPostsByType(type);
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  //카테고리별 게시글 분류. 물론 하나의 글 안에서는 액티비티 종류 + 장소 태그 둘 다 있는데,
  //나중에 집계할때 따로 집계해서 갖고올 일 있을 것 같아서 (추천알고리즘) 분류함)
  async getPostsByCategory(req, res) {
    try {
      const { category } = req.params; //장소, 유형
      const posts = await PostService.getPostsByCategory(catagory);
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  //태그로 게시물 분류
  async getPostsByTag(req, res) {
    try {
      const { tag } = req.params;
      const posts = await PostService.getPostsByTag(tag);
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  //정렬 기능 (시군별, 액티비티, 좋아요수)
  async getSortedPosts(req, res) {
    try {
      const { sortBy } = req.params; // "city", "activity", "likes"
      const posts = await PostService.getSortedPosts(sortBy);
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  //crud

  async getPosts(req, res) {
    try {
      const { type } = req.query; //후기 또는 일반 게시판 (자유 게시판)
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
