const express = require("express");
const SurveyResult = require("../models/surveyResult");
const router = express.Router();

// 설문조사 결과 저장
router.post("/results", async (req, res) => {
  const { userId, seaOrLand, indoorOrOutdoor, groupSize, season } = req.body;
  try {
    const newSurveyResult = new SurveyResult({
      userId,
      seaOrLand,
      indoorOrOutdoor,
      groupSize,
      season,
    });
    await newSurveyResult.save();
    res.status(201).json({ message: "Survey results saved" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
