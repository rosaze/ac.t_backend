const express = require('express');
const router = express.Router();
const HashtagController = require('../controllers/HashtagController');

router.get('/hashtags/top', HashtagController.getTopHashtags);
