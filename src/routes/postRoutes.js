const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const authorize = require('../middleware/authorize');

// 게시물 유형별 가져오기
router.get('/posts/type/:type', authorize, PostController.getPostsByType);

// 게시물 생성
router.post('/posts', authorize, PostController.createPost);

// 게시물 목록 가져오기
router.get('/posts', authorize, PostController.getPosts);

// 인기 게시물 가져오기
router.get('/posts/trending', authorize, PostController.getTrendingPosts);

// 정렬된 게시물 가져오기 (시군별, 액티비티, 좋아요수)
router.get('/posts/sorted', authorize, PostController.getSortedPosts);

// 좋아요순/최신순 드롭다운
router.get('/posts/dropdown', authorize, PostController.getPostsSortedBy);

// 필터링된 게시물 가져오기 //ok
router.get('/posts/filtered', authorize, PostController.getFilteredPosts);

// 게시물 검색 //ok
router.get('/posts/search', authorize, PostController.searchPosts);

// 게시물 ID로 게시물 가져오기
router.get('/posts/:id', authorize, PostController.getPostById);

// 게시물 수정
router.put('/posts/:id', authorize, PostController.updatePost);

// 게시물 삭제
router.delete('/posts/:id', authorize, PostController.deletePost);

// 카테고리별 게시물 가져오기
router.get(
  '/posts/category/:category',
  authorize,
  PostController.getPostsByCategory
);

// 태그별 게시물 가져오기
router.get('/posts/tag/:tag', authorize, PostController.getPostsByTag);

// 세 가지 기준으로 정렬된 게시물 가져오기
router.get('/posts/sort/:sortBy', authorize, PostController.getSortedPosts);

// 게시물 요약 가져오기
router.get('/posts/:id/summarize', authorize, PostController.summarizePost);

// 특정 장소와 활동 및 업체에 대한 감정 분석
router.get(
  '/posts/sentiment/:locationTag/:activityTag/:vendorTag',
  PostController.analyzeSentiments
);

module.exports = router;
