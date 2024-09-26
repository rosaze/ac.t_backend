const PostService = require('../services/PostService');
const SearchHistoryService = require('../services/SearchHistoryService');
const BadgeService = require('../services/badgeService');
//const User = require('../models/User'); // User 모델 경로에 맞게 조정하세요
//const Post = require('../models/Posts'); // 경로는 실제 Post 모델의 위치에 맞게 조정
class PostController {
  constructor() {
    this.postService = new PostService(new BadgeService());
    // Bind methods to ensure 'this' context is retained
    this.createPost = this.createPost.bind(this);
    this.getTrendingPosts = this.getTrendingPosts.bind(this);
    this.getPostsByType = this.getPostsByType.bind(this);
    this.getPostsByCategory = this.getPostsByCategory.bind(this);
    this.getPostsByTag = this.getPostsByTag.bind(this);
    this.getPostsSortedBy = this.getPostsSortedBy.bind(this);
    this.getFilteredPosts = this.getFilteredPosts.bind(this);
    this.searchPosts = this.searchPosts.bind(this);
    this.getPostById = this.getPostById.bind(this);
    this.updatePost = this.updatePost.bind(this);
    this.deletePost = this.deletePost.bind(this);
    this.summarizePost = this.summarizePost.bind(this);
    this.analyzeSentiments = this.analyzeSentiments.bind(this);
    this.likePost = this.likePost.bind(this);
    this.unlikePost = this.unlikePost.bind(this);
  }

  async createPost(req, res) {
    try {
      const userId = req.user.id;
      const postData = {
        ...req.body,
        author: userId,
      };

      const post = await this.postService.createPost(userId, postData);
      await this.postService.saveWeatherDataAndActivity(req.body, post._id);

      return res.status(201).json(post);
    } catch (error) {
      console.error('게시글 저장 중 오류:', error.message);
      return res.status(500).json({ message: '게시글 생성 실패' });
    }
  }

  async getTrendingPosts(req, res) {
    try {
      const posts = await this.postService.getTrendingPosts();
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in getTrendingPosts:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getPostsByType(req, res) {
    try {
      const { type } = req.params;
      const posts = await this.postService.getPostsByType(type);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in getPostsByType:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getPostsByCategory(req, res) {
    try {
      const { category } = req.params;
      const posts = await this.postService.getPostsByCategory(category);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in getPostsByCategory:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getPostsByTag(req, res) {
    try {
      const { tag } = req.params;
      const posts = await this.postService.getPostsByTag(tag);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in getPostsByTag:', err.message);
      res.status(500).json({ message: err.message });
    }
  }
  //최신순이 아니면 자동으로좋아요 순 기준으로 정렬
  //최신순인 경우 생성일 기준 내림차순, 그 외에는 좋아요 수 기준 내림차순
  async getPostsSortedBy(req, res) {
    try {
      const sortOption = req.query.sort;
      const posts = await this.postService.getPostsSortedBy(sortOption);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in getPostsSortedBy:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getSortedPosts(req, res) {
    try {
      const { sortBy } = req.params;
      const posts = await this.postService.getSortedPosts(sortBy);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in getSortedPosts:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getFilteredPosts(req, res) {
    try {
      const filters = {
        location: req.query.location,
        activity: req.query.activity,
        vendor: req.query.vendor,
      };
      const posts = await this.postService.getFilteredPosts(filters);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in getFilteredPosts:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async searchPosts(req, res) {
    try {
      const userId = req.user.id;
      const keyword = req.query.keyword;
      const searchType = 'post';

      if (!keyword) {
        return res.status(400).json({ message: 'Keyword is missing' });
      }

      const posts = await this.postService.searchPosts(keyword);
      await SearchHistoryService.logSearch(userId, keyword, searchType);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in searchPosts:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getPosts(req, res) {
    try {
      const { type } = req.query;
      const posts = await this.postService.getPosts(type);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in getPosts:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getPostById(req, res) {
    try {
      const post = await this.postService.getPostById(req.params.id);
      res.status(200).json(post);
    } catch (err) {
      console.error('Error in getPostById:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async updatePost(req, res) {
    try {
      const post = await this.postService.updatePost(req.params.id, req.body);
      res.status(200).json(post);
    } catch (err) {
      console.error('Error in updatePost:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async deletePost(req, res) {
    try {
      await this.postService.deletePost(req.params.id);
      res.status(204).send();
    } catch (err) {
      console.error('Error in deletePost:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async summarizePost(req, res) {
    try {
      const summary = await this.postService.summarizePostContent(
        req.params.id
      );
      res.status(200).json(summary);
    } catch (err) {
      console.error('Error in summarizePost:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async analyzeSentiments(req, res) {
    try {
      const { locationTag, activityTag, vendorTag } = req.params;
      const sentiments = await this.postService.analyzeSentiments(
        locationTag,
        activityTag,
        vendorTag
      );
      res.status(200).json(sentiments);
    } catch (err) {
      console.error('Error in analyzeSentiments:', err.message);
      res.status(500).json({ message: err.message });
    }
  }
  async likePost(req, res) {
    try {
      const postId = req.params.id;
      const userId = req.user.id;
      const updatedPost = await this.postService.likePost(postId, userId);
      res.status(200).json(updatedPost);
    } catch (err) {
      console.error('Error in likePost:', err.message);
      res.status(400).json({ message: err.message });
    }
  }

  async unlikePost(req, res) {
    try {
      const postId = req.params.id;
      const userId = req.user.id;
      const updatedPost = await this.postService.unlikePost(postId, userId);
      res.status(200).json(updatedPost);
    } catch (err) {
      console.error('Error in unlikePost:', err.message);
      res.status(400).json({ message: err.message });
    }
  }
}

module.exports = new PostController();
