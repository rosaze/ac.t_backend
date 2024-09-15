const express = require('express');
const router = express.Router();
const HashtagController = require('../controllers/HashtagController');
const authorize = require('../middleware/authorize');

// 해시태그 생성 (로그인 필요)
router.post('/hashtags', authorize, HashtagController.createHashtag);

// 대기 중인 해시태그 조회 (개발자 권한 필요)
router.get(
  '/hashtags/pending',
  authorize,
  (req, res, next) => {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: 'Access denied. Developer rights required.' });
    }
    next();
  },
  HashtagController.getPendingHashtags
);

// 해시태그 승인 (개발자 권한 필요)
router.post(
  '/hashtags/:hashtagId/approve',
  authorize,
  (req, res, next) => {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: 'Access denied. Developer rights required.' });
    }
    next();
  },
  HashtagController.approveHashtag
);

// 해시태그 거부 (개발자 권한 필요)
router.post(
  '/hashtags/:hashtagId/reject',
  authorize,
  (req, res, next) => {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: 'Access denied. Developer rights required.' });
    }
    next();
  },
  HashtagController.rejectHashtag
);

// 인기 해시태그 조회 (공개)
router.get('/hashtags/top', HashtagController.getTopHashtags);

module.exports = router;
