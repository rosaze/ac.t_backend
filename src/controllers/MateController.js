const MateService = require('../services/MateService');

class MateController {
  async createMatePost(req, res) {
    try {
      const matePost = await MateService.createMatePost(req.body);
      res.status(201).json(matePost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  //모집게시글필터링
  async getMatePosts(req, res) {
    try {
      const filters = {
        activity: req.query.activity,
        location: req.query.location,
        date: req.query.date,
        sortBy: req.query.sortBy,
      };
      const matePosts = await MateService.getMatePosts(filters);
      res.status(200).json(matePosts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  async getMatePostById(req, res) {
    try {
      const matePost = await MateService.getMatePostById(req.params.id);
      res.status(200).json(matePost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async joinMatePost(req, res) {
    try {
      const matePost = await MateService.joinMatePost(
        req.params.id,
        req.body.userId
      );
      res.status(200).json(matePost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async leaveMatePost(req, res) {
    try {
      const matePost = await MateService.leaveMatePost(
        req.params.id,
        req.body.userId
      );
      res.status(200).json(matePost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async deleteMatePost(req, res) {
    try {
      await MateService.deleteMatePost(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new MateController();
