const badgeService = require('../services/badgeService');

exports.awardBadge = async (req, res) => {
  try {
    const { userId, badgeName } = req.body;
    const user = await badgeService.awardBadge(userId, badgeName);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUserBadges = async (req, res) => {
  try {
    const userBadges = await badgeService.getUserBadges(req.params.userId);
    res.json(userBadges);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
