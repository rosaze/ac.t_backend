const activityMapService = require('../services/activityMapService');

class ActivityMapController {
  // 액티비티 맵 추가
  async addActivityMap(req, res) {
    try {
      const activityMap = await activityMapService.addActivityMap(req.body);
      res.json(activityMap);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 특정 사용자의 액티비티 맵 가져오기
  async getActivityMaps(req, res) {
    try {
      const activityMaps = await activityMapService.getActivityMaps(
        req.params.userId
      );
      res.json(activityMaps);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ActivityMapController();
