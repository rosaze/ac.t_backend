const badgeService = require('../services/badgeService');

class BadgeController {
  // 배지 수여
  async awardBadge(req, res) {
    try {
      const { userId, badgeName } = req.body;
      const user = await badgeService.awardBadge(userId, badgeName);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 특정 사용자의 배지 목록 가져오기
  async getUserBadges(req, res) {
    try {
      const userBadges = await badgeService.getUserBadges(req.params.userId);
      res.json(userBadges);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new BadgeController();
