const activityMapService = require('../services/activityMapService');

exports.addActivityMap = async (req, res) => {
  try {
    const activityMap = await activityMapService.addActivityMap(req.body);
    res.json(activityMap);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getActivityMaps = async (req, res) => {
  try {
    const activityMaps = await activityMapService.getActivityMaps(
      req.params.userId
    );
    res.json(activityMaps);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
