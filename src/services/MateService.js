//메이트 게시글 CRUD 처리
const Mate = require('../models/Mate');
const User = require('../models/User');
const PreferenceService = require('./preferenceService');

//새로운 메이트 게시글 생성할 때, User모델에서 해당 사용자의 선호도 정보를 가져와 이를 Mate모델에 포함시킴
class MateService {
  async createMatePost(data) {
    const mate = new Mate(data);
    return await mate.save();
  }

  // 필터링 기능 추가 --> 조건으로 게시글 필터링 ( 활동/장소/날짜)
  async getMatePosts(filters) {
    const query = {};

    if (filters.activityTag) {
      query.activityTag = filters.activityTag;
    }
    if (filters.locationTag) {
      query.locationTag = filters.locationTag;
    }
    if (filters.date) {
      query.date = { $gte: new Date(filters.date) }; // 선택한 날짜 이후의 활동만
    }
    if (filters.personal_preferences) {
      query.personal_preferences = filters.personal_preferences;
    }

    const sortCriteria =
      filters.sortBy === 'date' ? { date: 1 } : { createdAt: -1 };

    return await Mate.find(query)
      .sort(sortCriteria)
      .populate('author participants')
      .exec();
  }
  async filterMatePostsByLocation(locationTag) {
    return await Mate.find({ locationTag })
      .populate('author participants')
      .exec();
  }
  async filterMatePostsByUserPreferences(userId) {
    // Use PreferenceService to get user preferences
    const userPreferences = await PreferenceService.recommendPreferenceUpdate(
      userId
    );

    // Build a query based on the user's preferences
    const query = {};
    if (userPreferences && userPreferences.recommendations.length > 0) {
      query.personal_preferences = userPreferences.recommendations.join('_');
    }

    return await Mate.find(query).populate('author participants').exec();
  }

  async filterMatePostsByActivity(activityTag) {
    // Use the activityTag to filter mate posts
    return await Mate.find({ activityTag })
      .populate('author participants')
      .exec();
  }
  async filterMatePostsByPreferences(preferences) {
    const query = {};

    if (preferences.personal_preferences) {
      query.personal_preferences = preferences.personal_preferences;
    }

    return await Mate.find(query).populate('author participants').exec();
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
