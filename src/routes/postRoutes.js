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
module.exports = router;
