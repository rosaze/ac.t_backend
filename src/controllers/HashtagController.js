const HashtagService = require('../services/HashtagService');

class HashtagController {
  async createHashtag(req, res) {
    try {
      const { userId } = req.user;
      const hashtag = await HashtagService.createHashtag(userId, req.body);
      res.status(201).json(hashtag);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getPendingHashtags(req, res) {
    try {
      const hashtags = await HashtagService.getPendingHashtags();
      res.status(200).json(hashtags);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async approveHashtag(req, res) {
    try {
      const { hashtagId } = req.params;
      const { id: developerId } = req.user;
      const hashtag = await HashtagService.approveHashtag(
        hashtagId,
        developerId
      );
      res.status(200).json(hashtag);
    } catch (err) {
      res
        .status(err.message.includes('Unauthorized') ? 403 : 500)
        .json({ message: err.message });
    }
  }

  async rejectHashtag(req, res) {
    try {
      const { hashtagId } = req.params;
      const { id: developerId } = req.user;
      const result = await HashtagService.rejectHashtag(hashtagId, developerId);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(err.message.includes('Unauthorized') ? 403 : 500)
        .json({ message: err.message });
    }
  }

  async getTopHashtags(req, res) {
    try {
      const hashtags = await HashtagService.getTopHashtags();
      res.status(200).json(hashtags);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new HashtagController();
