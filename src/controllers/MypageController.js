// controllers/MyPageController.js

const BadgeService = require('../services/badgeService');
const PreferenceService = require('../services/preferenceService');
const ActivityMapService = require('../services/activityMapService');
const WishlistService = require('../services/WishlistService');

class MyPageController {
  async getMyPageData(req, res) {
    const userId = req.user._id;

    try {
      const badges = await BadgeService.getBadges(userId);
      const preferences = await PreferenceService.getPreferences(userId);
      const activityMap = await ActivityMapService.getActivityMap(userId);
      const wishlist = await WishlistService.getWishlist(userId);

      res.status(200).json({ badges, preferences, activityMap, wishlist });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Failed to load my page data', error: error.message });
    }
  }
}

module.exports = new MyPageController();
