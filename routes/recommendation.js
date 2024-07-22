const express = require("express");
const SurveyResult = require("../models/surveyResult");
const Activity = require("../models/activity");
const router = express.Router();

// 추천 액티비티 조회
router.get("/", async (req, res) => {
  const { userId } = req.query;
  try {
    const surveyResult = await SurveyResult.findOne({ userId });
    const recommendations = await Activity.find({
      seaOrLand: surveyResult.seaOrLand,
      indoorOrOutdoor: surveyResult.indoorOrOutdoor,
      groupSize: surveyResult.groupSize,
      season: surveyResult.season,
    });
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
