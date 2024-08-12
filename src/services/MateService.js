//메이트 게시글 CRUD 처리
const Mate = require('../models/Mate');

class MateService {
  async createMatePost(data) {
    const mate = new Mate(data);
    return await mate.save();
  }

  // 필터링 기능 추가 --> 조건으로 게시글 필터링 ( 활동/장소/날짜)

  async getMatePosts(sortBy) {
    const query = {};

    if (filters.activity) {
      query.activity = filters.activity;
    }
    if (filters.location) {
      query.location = filters.location;
    }
    if (filters.date) {
      query.date = { $gte: new Date(filters.date) }; // 선택한 날짜 이후의 활동만
    }

    const sortCriteria =
      filters.sortBy === 'date' ? { date: 1 } : { createdAt: -1 };

    return await Mate.find(query)
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
