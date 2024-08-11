//메이트 게시글 CRUD 처리
const Mate = require('../models/Mate');

class MateService {
  async createMatePost(data) {
    const mate = new Mate(data);
    return await mate.save();
  }

  async getMatePosts(sortBy) {
    const sortCriteria = sortBy === 'date' ? { date: 1 } : { createdAt: -1 };
    return await Mate.find()
      .sort(sortCriteria)
      .populate('author participants')
      .exec();
  }

  async getMatePostById(id) {
    return await Mate.findById(id).populate('author participants').exec();
  }

  async joinMatePost(id, userId) {
    return await Mate.findByIdAndUpdate(
      id,
      { $addToSet: { participants: userId } },
      { new: true }
    )
      .populate('author participants')
      .exec();
  }

  async leaveMatePost(id, userId) {
    return await Mate.findByIdAndUpdate(
      id,
      { $pull: { participants: userId } },
      { new: true }
    )
      .populate('author participants')
      .exec();
  }

  async deleteMatePost(id) {
    return await Mate.findByIdAndDelete(id).exec();
  }
}

module.exports = new MateService();
