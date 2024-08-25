const express = require('express');
const router = express.Router();
const HashtagController = require('../controllers/HashtagController');

// 상위 해시태그를 가져오는 라우트
router.get('/top-hashtags', HashtagController.getTopHashtags);

module.exports = router;
