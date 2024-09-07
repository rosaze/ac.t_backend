const PostService = require('../services/PostService');
const ActivityMapService = require('../services/activityMapService');
const SearchHistoryService = require('../services/SearchHistoryService');
const User = require('../models/user'); // User 모델 경로에 맞게 조정하세요
const Post = require('../models/Posts'); // 경로는 실제 Post 모델의 위치에 맞게 조정

class PostController {
  async createPost(req, res) {
    console.log('createPost called with data:', req.body);
    try {
      // 사용자 ID가 유효한지 확인
      const user = await User.findById(req.body.author);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const post = await PostService.createPost(req.body);
      console.log('Post created:', post);

      await ActivityMapService.addActivityMap({
        user: req.body.author,
        post: post._id,
        region: req.body.locationTag,
        activity_date: new Date(),
        hashtags: [
          req.body.locationTag,
          req.body.activityTag,
          req.body.vendorTag,
        ],
      });
      console.log('Activity map updated for post:', post._id);
      res.status(201).json(post);
    } catch (err) {
      console.error('Error in createPost:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getTrendingPosts(req, res) {
    console.log('getTrendingPosts called');
    try {
      const posts = await PostService.getTrendingPosts();
      console.log('Trending posts retrieved:', posts);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in getTrendingPosts:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getPostsByType(req, res) {
    console.log('getPostsByType called with type:', req.params.type);
    try {
      const { type } = req.params;
      const posts = await PostService.getPostsByType(type);
      console.log('Posts retrieved by type:', posts);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in getPostsByType:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getPostsByCategory(req, res) {
    console.log(
      'getPostsByCategory called with category:',
      req.params.category
    );
    try {
      const { category } = req.params;
      const posts = await PostService.getPostsByCategory(category);
      console.log('Posts retrieved by category:', posts);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in getPostsByCategory:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getPostsByTag(req, res) {
    console.log('getPostsByTag called with tag:', req.params.tag);
    try {
      const { tag } = req.params;
      const posts = await PostService.getPostsByTag(tag);
      console.log('Posts retrieved by tag:', posts);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in getPostsByTag:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getPostsSortedBy(req, res) {
    console.log('getPostsSortedBy called with sort option:', req.query.sort);
    try {
      const sortOption = req.query.sort;
      const posts = await PostService.getPostsSortedBy(sortOption);
      console.log('Posts sorted by:', sortOption, posts);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in getPostsSortedBy:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getSortedPosts(req, res) {
    console.log('getSortedPosts called with sortBy:', req.params.sortBy);
    try {
      const { sortBy } = req.params;
      const posts = await PostService.getSortedPosts(sortBy);
      console.log('Posts sorted by:', sortBy, posts);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in getSortedPosts:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getFilteredPosts(req, res) {
    console.log('getFilteredPosts called with filters:', req.query);
    try {
      const filters = {
        location: req.query.location,
        activity: req.query.activity,
        vendor: req.query.vendor,
      };
      const posts = await PostService.getFilteredPosts(filters);
      console.log('Filtered posts retrieved:', posts);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in getFilteredPosts:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async searchPosts(req, res) {
    console.log('searchPosts called with query:', req.query.q);
    try {
      const userId = req.user.id; // Assume user is authenticated
      const keyword = req.query.keyword;
      const searchType = 'post';

      if (!keyword) {
        return res.status(400).json({ message: 'Keyword is missing' });
      }

      const posts = await PostService.searchPosts(keyword);
      console.log('Search results:', posts);

      await SearchHistoryService.logSearch(userId, keyword, searchType);
      console.log('Search history logged for user:', userId);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in searchPosts:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getPosts(req, res) {
    console.log('getPosts called with query:', req.query);
    try {
      const { type } = req.query;
      // type 값에 따라 쿼리 설정
      const query =
        type === 'review'
          ? { type: 'review' } // 리뷰 게시물만
          : type === 'general'
          ? { type: 'general' } // 일반 게시물만
          : {}; // type이 없을 경우 모든 게시물

      const posts = await PostService.getPosts();
      console.log('Posts retrieved:', posts);
      res.status(200).json(posts);
    } catch (err) {
      console.error('Error in getPosts:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getPostById(req, res) {
    console.log('getPostById called with id:', req.params.id);
    try {
      const post = await PostService.getPostById(req.params.id);
      console.log('Post retrieved by ID:', post);
      res.status(200).json(post);
    } catch (err) {
      console.error('Error in getPostById:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async updatePost(req, res) {
    console.log(
      'updatePost called with id:',
      req.params.id,
      'and data:',
      req.body
    );
    try {
      const post = await PostService.updatePost(req.params.id, req.body);
      console.log('Post updated:', post);
      res.status(200).json(post);
    } catch (err) {
      console.error('Error in updatePost:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async deletePost(req, res) {
    console.log('deletePost called with id:', req.params.id);
    try {
      const postId = req.params.id;
      const post = await Post.findByIdAndDelete(postId); // MongoDB에서 해당 ID의 게시물을 삭제

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      res.status(204).send(); // 성공적으로 삭제되면 204 No Content 반환
    } catch (err) {
      console.error('Error in deletePost:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async summarizePost(req, res) {
    console.log('summarizePost called with id:', req.params.id);
    try {
      const summary = await PostService.summarizePostContent(req.params.id);
      console.log('Post summary:', summary);
      res.status(200).json(summary);
    } catch (err) {
      console.error('Error in summarizePost:', err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async analyzeSentiments(req, res) {
    console.log('analyzeSentiments called with params:', req.params);
    try {
      const { locationTag, activityTag, vendorTag } = req.params;
      const sentiments = await PostService.analyzeSentiments(
        locationTag,
        activityTag,
        vendorTag
      );
      console.log('Sentiment analysis results:', sentiments);
      res.status(200).json(sentiments);
    } catch (err) {
      console.error('Error in analyzeSentiments:', err.message);
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new PostController();
