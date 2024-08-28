//라우팅 정의

const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const authorize = require('../middleware/authorize');

router.get('/posts/type/:type', authorize, PostController.getPostsByType);
router.post('/posts', authorize, PostController.createPost);
router.get('/posts', authorize, PostController.getPosts); //ok
router.get('/posts/:id', authorize, PostController.getPostById); //OK
router.put('/posts/:id', authorize, PostController.updatePost);
router.delete('/posts/:id', authorize, PostController.deletePost);
router.get(
  '/posts/category/:category',
  authorize,
  PostController.getPostsByCategory
); //카테고리 분류 추가
router.get('/posts/tag/:tag', authorize, PostController.getPostsByTag); //태그 분류 추가
router.get('/posts/top', authorize, PostController.getTrendingPosts); // 인기 게시물
router.get('/posts/sort/:sortBy', authorize, PostController.getSortedPosts); // 세가지로 정렬
router.get('/posts/:id/summarize', authorize, PostController.summarizePost); // 후기 요약
router.get(
  '/posts/sentiment/:locationTag/:activityTag/:vendorTag',
  PostController.analyzeSentiments
); // 특정 장소와 활동,+ 업체 에 대한 감정 분석

//추가된 라우터들 (검색,필터,정렬)
router.get('/posts/trending', authorize, PostController.getTrendingPosts); // 인기 급상승 게시물
router.get('/posts/sorted', authorize, PostController.getSortedPosts); //정렬 기능 (시군별, 액티비티, 좋아요수)
router.get('/posts/dropdown', authorize, PostController.getPostsSortedBy); // 좋아요순/최신순 드롭다운
router.get('/posts/filtered', authorize, PostController.getFilteredPosts); // 필터링 기능
router.get('/posts/search', authorize, PostController.searchPosts); // 검색 기능

module.exports = router;
