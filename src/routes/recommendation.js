const express = require('express');
const User = require('../models/user');
const Activity = require('../models/activity');
const router = express.Router();

// 추천 액티비티 조회
router.get('/', async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const recommendations = await Activity.find({
      seaOrLand: user.surveyResult.seaOrLand,
      indoorOrOutdoor: user.surveyResult.indoorOrOutdoor,
      groupSize: user.surveyResult.groupSize,
      season: user.surveyResult.season,
    });

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
