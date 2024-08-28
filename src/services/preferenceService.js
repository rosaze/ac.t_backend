const User = require('../models/User');
const ActivityRecommendationService = require('./activityRecommendationService');

class PreferenceService {
  // 사용자 활동 기반 선호도 변경 추천
  static async recommendPreferenceUpdate(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const locationActivities = {
      outdoor: user.activities.filter(
        (activity) => activity.location === 'outdoor'
      ).length,
      indoor: user.activities.filter(
        (activity) => activity.location === 'indoor'
      ).length,
    };

    const environmentActivities = {
      sea: user.activities.filter((activity) => activity.region === 'sea')
        .length,
      mountain: user.activities.filter(
        (activity) => activity.region === 'mountain'
      ).length,
    };

    const groupActivities = {
      group: user.activities.filter(
        (activity) => activity.group_size === 'group'
      ).length,
      individual: user.activities.filter(
        (activity) => activity.group_size === 'individual'
      ).length,
    };

    const seasonActivities = {
      winter: user.activities.filter((activity) => activity.season === 'winter')
        .length,
      summer: user.activities.filter((activity) => activity.season === 'summer')
        .length,
    };

    const recommendations = [];

    if (
      locationActivities.outdoor > locationActivities.indoor &&
      user.location_preference === 'indoor'
    ) {
      recommendations.push('outdoor');
    } else if (
      locationActivities.indoor > locationActivities.outdoor &&
      user.location_preference === 'outdoor'
    ) {
      recommendations.push('indoor');
    }

    if (
      environmentActivities.mountain > environmentActivities.sea &&
      user.environment_preference === 'sea'
    ) {
      recommendations.push('mountain');
    } else if (
      environmentActivities.sea > environmentActivities.mountain &&
      user.environment_preference === 'mountain'
    ) {
      recommendations.push('sea');
    }

    if (
      groupActivities.group > groupActivities.individual &&
      user.group_preference === 'individual'
    ) {
      recommendations.push('group');
    } else if (
      groupActivities.individual > groupActivities.group &&
      user.group_preference === 'group'
    ) {
      recommendations.push('individual');
    }

    if (
      seasonActivities.winter > seasonActivities.summer &&
      user.season_preference === 'summer'
    ) {
      recommendations.push('winter');
    } else if (
      seasonActivities.summer > seasonActivities.winter &&
      user.season_preference === 'winter'
    ) {
      recommendations.push('summer');
    }

    if (recommendations.length > 0) {
      return {
        message: `We noticed your activities align more with the following preferences: ${recommendations.join(
          ', '
        )}. Would you like to update your preferences accordingly?`,
        recommendations,
      };
    }

    return null;
  }

  // 사용자 선호도 설정 및 업데이트
  static async updatePreferences(userId, preferences) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.location_preference = preferences.location;
    user.environment_preference = preferences.environment;
    user.group_preference = preferences.group;
    user.season_preference = preferences.season;

    await user.save();

    // 선호도 기반 추천 활동 제공
    return ActivityRecommendationService.recommendActivities(user._id);
  }

  // 상위 메소드로 전체 과정을 관리
  static async manageUserPreferences(userId, preferences) {
    // 선호도 변경 추천을 먼저 제공
    const recommendation = await this.recommendPreferenceUpdate(userId);

    // 사용자가 추천을 받아들였는지 여부를 확인하고 업데이트
    if (preferences.accepted) {
      return await this.updatePreferences(userId, preferences);
    }

    return recommendation;
  }

  // 추천 활동 가져오기
  static async getRecommendedActivities(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return ActivityRecommendationService.recommendActivities(user._id);
  }
}

module.exports = PreferenceService;
