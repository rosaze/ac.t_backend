//라우팅 정의

const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');

router.get('/posts/type/:type', PostController.getPostsByType);
router.post('/posts', PostController.createPost);
router.get('/posts', PostController.getPosts);
router.get('/posts/:id', PostController.getPostById);
router.put('/posts/:id', PostController.updatePost);
router.delete('/posts/:id', PostController.deletePost);
router.get('/posts/category/:category', PostController.getPostsByCategory); //카테고리 분류 추가
router.get('/posts/tag/:tag', PostController.getPostsByTag); //태그 분류 추가
router.get('/posts/top', PostController.getTopPosts); // 인기 게시물
router.get('/posts/sort/:sortBy', PostController.getSortedPosts); // 세가지로 정렬
router.get('/posts/:id/summarize', PostController.summarizePost); // 후기 요약
router.get(
  '/posts/sentiment/:locationTag/:activityTag',
  PostController.analyzeSentiments
); // 특정 장소와 활동에 대한 감정 분석

//추가된 라우터들 (검색,필터,정렬)
router.get('/posts/trending', PostController.getTrendingPosts); // 인기 급상승 게시물
router.get('/posts/popular-tags', PostController.getPopularTagCombinations); // 인기 해시태그 조합
router.get('/posts/sorted', PostController.getPostsSortedBy); // 정렬 기능
router.get('/posts/filtered', PostController.getFilteredPosts); // 필터링 기능
router.get('/posts/search', PostController.searchPosts); // 검색 기능

module.exports = router;
