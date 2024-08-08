const HashtagService = require('../services/HashtagService');

class HashtagController {
  async getTopHashtags(req, res) {
    try {
      const hashtags = await HashtagService.getTopHashtags;
      res.status(200).json(hashtags);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new HashtagController();
